import * as Automerge from 'automerge';
import DiffMatchPatch from 'diff-match-patch';
import { useEffect, useState } from 'react';
import { fluentPadServiceId, notifyTextUpdateFnName } from 'src/fluence/constants';
import { subscribeToEvent } from 'src/fluence/exApi';
import { useFluenceClient } from './FluenceClientContext';
import * as calls from 'src/fluence/calls';

interface TextDoc {
    value: Automerge.Text;
}

const dmp = new DiffMatchPatch();

const getUpdatedDocFromText = (oldDoc: TextDoc | null, newText: string) => {
    const prevText = oldDoc ? oldDoc.value.toString() : '';
    const diff = dmp.diff_main(prevText, newText);
    dmp.diff_cleanupSemantic(diff);
    const patches = dmp.patch_make(prevText, diff);

    const newDoc = Automerge.change(oldDoc, (doc) => {
        patches.forEach((patch) => {
            let idx = patch.start1;
            patch.diffs.forEach(([operation, changeText]) => {
                switch (operation) {
                    case 1: // Insertion
                        doc.value.insertAt!(idx, ...changeText.split(''));
                        break;
                    case 0: // No Change
                        idx += changeText.length;
                        break;
                    case -1: // Deletion
                        for (let i = 0; i < changeText.length; i++) {
                            doc.value.deleteAt!(idx);
                        }
                        break;
                }
            });
        });
    });

    return newDoc;
};

const parseState = (entry: calls.Entry) => {
    try {
        const obj = JSON.parse(entry.body);
        if (obj.fluentPadState) {
            return Automerge.load(obj.fluentPadState) as TextDoc;
        }

        return null;
    } catch (e) {
        console.log('couldnt parse state format: ' + entry.body);
        return null;
    }
};

const applyStates = (startingDoc: TextDoc | null, entries: calls.Entry[]) => {
    let res = startingDoc;
    for (let entry of entries) {
        const state = parseState(entry) as TextDoc;
        if (state) {
            if (!res) {
                res = state;
            } else {
                res = Automerge.merge(res, state);
            }
        }
    }

    return res;
};

export const CollaborativeEditor = () => {
    const client = useFluenceClient()!;
    const [text, setText] = useState<TextDoc | null>(null);

    useEffect(() => {
        const unsub1 = subscribeToEvent(client, fluentPadServiceId, notifyTextUpdateFnName, (args, tetraplets) => {
            console.log(args, tetraplets);
            // TODO
        });

        // don't block
        calls.getHistory(client).then((res) => {
            const newDoc = applyStates(text, res);
            setText(newDoc);
        });

        return () => {
            unsub1();
        };
    }, []);

    const amHistory = text
        ? Automerge.getHistory(text).map((x) => {
              return x.snapshot.value;
          })
        : [];

    const textValue = text ? text.value.toString() : '';

    const handleTextUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newDoc = getUpdatedDocFromText(text, e.target.value)!;
        setText(newDoc);

        // don't block
        setImmediate(async () => {
            const entry = {
                fluentPadState: Automerge.save(newDoc),
            };
            const entryStr = JSON.stringify(entry);

            await calls.addEntry(client, entryStr);
        });
    };

    return (
        <div>
            <textarea value={textValue} disabled={!text} onChange={handleTextUpdate} />
            Automerge changes:
            <ul>
                {amHistory.map((value, index) => (
                    <li key={index}>{value}</li>
                ))}
            </ul>
        </div>
    );
};
