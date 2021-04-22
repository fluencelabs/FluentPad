/**
 *
 * This file is auto-generated. Do not edit manually: changes may be erased.
 * Generated by Aqua compiler: https://github.com/fluencelabs/aqua/.
 * If you find any bugs, please write an issue on GitHub: https://github.com/fluencelabs/aqua/issues
 *
 */
import { FluenceClient, PeerIdB58 } from '@fluencelabs/fluence';
import { RequestFlowBuilder } from '@fluencelabs/fluence/dist/api.unstable';

export async function join(
    client: FluenceClient,
    user: { name: string; peer_id: string; relay_id: string },
): Promise<{ err_msg: string; ret_code: number }> {
    let request;
    const promise = new Promise<{ err_msg: string; ret_code: number }>((resolve, reject) => {
        request = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (seq
    (seq
     (call %init_peer_id% ("getDataSrv" "relay") [] relay)
     (call %init_peer_id% ("getDataSrv" "user") [] user)
    )
    (seq
     (call %init_peer_id% ("fluence/get-config" "getApp") [] app)
     (seq
      (call relay ("op" "identity") [])
      (call app.$.user_list.peer_id! (app.$.user_list.service_id! "join") [user] res)
     )
    )
   )
   (call relay ("op" "identity") [])
  )
  (call %init_peer_id% ("callbackSrv" "response") [res])
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error%])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', 'relay', () => {
                    return client.relayPeerId!;
                });
                h.on('getRelayService', 'hasReleay', () => {
                    // Not Used
                    return client.relayPeerId !== undefined;
                });
                h.on('getDataSrv', 'user', () => {
                    return user;
                });
                h.onEvent('callbackSrv', 'response', (args) => {
                    const [res] = args;
                    resolve(res);
                });

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for join');
            })
            .build();
    });
    await client.initiateFlow(request);
    return promise;
}

export async function getUserList(
    client: FluenceClient,
): Promise<{ name: string; peer_id: string; relay_id: string }[]> {
    let request;
    const promise = new Promise<{ name: string; peer_id: string; relay_id: string }[]>((resolve, reject) => {
        request = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (seq
    (call %init_peer_id% ("getDataSrv" "relay") [] relay)
    (seq
     (call %init_peer_id% ("fluence/get-config" "getApp") [] app)
     (seq
      (call relay ("op" "identity") [])
      (call app.$.user_list.peer_id! (app.$.user_list.service_id! "get_users") [] allUsers)
     )
    )
   )
   (call relay ("op" "identity") [])
  )
  (call %init_peer_id% ("callbackSrv" "response") [allUsers.$.users!])
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error%])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', 'relay', () => {
                    return client.relayPeerId!;
                });
                h.on('getRelayService', 'hasReleay', () => {
                    // Not Used
                    return client.relayPeerId !== undefined;
                });

                h.onEvent('callbackSrv', 'response', (args) => {
                    const [res] = args;
                    resolve(res);
                });

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for getUserList');
            })
            .build();
    });
    await client.initiateFlow(request);
    return promise;
}

export async function initAfterJoin(
    client: FluenceClient,
    me: { name: string; peer_id: string; relay_id: string },
): Promise<{ name: string; peer_id: string; relay_id: string }[]> {
    let request;
    const promise = new Promise<{ name: string; peer_id: string; relay_id: string }[]>((resolve, reject) => {
        request = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (seq
    (call %init_peer_id% ("getDataSrv" "relay") [] relay)
    (call %init_peer_id% ("getDataSrv" "me") [] me)
   )
   (seq
    (seq
     (seq
      (call %init_peer_id% ("fluence/get-config" "getApp") [] app)
      (seq
       (call relay ("op" "identity") [])
       (call app.$.user_list.peer_id! (app.$.user_list.service_id! "get_users") [] allUsers)
      )
     )
     (call relay ("op" "identity") [])
    )
    (fold allUsers.$.users! user
        (par
            (seq
                (seq
                    (seq
                        (call relay ("op" "identity") [])
                        (call user.$.relay_id! ("peer" "is_connected") [user.$.peer_id!] isOnline)
                    )
                    (call relay ("op" "identity") [])
                )
                (par
                    (xor
                        (match isOnline true
                            (seq
                                (seq
                                    (call relay ("op" "identity") [])
                                    (call user.$.relay_id! ("op" "identity") [])
                                )
                                (call user.$.peer_id! ("fluence/fluent-pad" "notifyUserAdded") [me true])
                            )
                        )
                        (null)
                    )
                    (seq
                        (call relay ("op" "identity") [])
                        (call %init_peer_id% ("fluence/fluent-pad" "notifyUserAdded") [user isOnline])
                    )
                )
            )
            (next user)
        )
    )
   )
  )
  (call %init_peer_id% ("callbackSrv" "response") [allUsers])
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error%])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', 'relay', () => {
                    return client.relayPeerId!;
                });
                h.on('getRelayService', 'hasReleay', () => {
                    // Not Used
                    return client.relayPeerId !== undefined;
                });
                h.on('getDataSrv', 'me', () => {
                    return me;
                });
                h.onEvent('callbackSrv', 'response', (args) => {
                    const [res] = args;
                    resolve(res);
                });

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for initAfterJoin');
            })
            .build();
    });
    await client.initiateFlow(request);
    return promise;
}

export async function updateOnlineStatuses(client: FluenceClient): Promise<void> {
    let request;
    const promise = new Promise<void>((resolve, reject) => {
        request = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (call %init_peer_id% ("getDataSrv" "relay") [] relay)
  (seq
   (seq
    (seq
     (call %init_peer_id% ("fluence/get-config" "getApp") [] app)
     (seq
      (call relay ("op" "identity") [])
      (call app.$.user_list.peer_id! (app.$.user_list.service_id! "get_users") [] allUsers)
     )
    )
    (call relay ("op" "identity") [])
   )
   (fold allUsers.$.users! user
    (par
     (seq
      (seq
       (seq
        (seq
         (seq
          (call relay ("op" "identity") [])
          (call user.$.relay_id! ("op" "identity") [])
         )
         (call user.$.peer_id! ("peer" "is_connected") [user.$.peer_id!] isOnline)
        )
        (call user.$.relay_id! ("op" "identity") [])
       )
       (call relay ("op" "identity") [])
      )
      (call %init_peer_id% ("fluence/fluent-pad" "notifyOnline") [user.$.peer_id! isOnline])
     )
     (next user)
    )
   )
  )
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error%])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', 'relay', () => {
                    return client.relayPeerId!;
                });
                h.on('getRelayService', 'hasReleay', () => {
                    // Not Used
                    return client.relayPeerId !== undefined;
                });

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for updateOnlineStatuses');
            })
            .build();
    });
    await client.initiateFlow(request);
    return Promise.race([promise, Promise.resolve()]);
}

export async function leave(client: FluenceClient, currentUserName: string): Promise<void> {
    let request;
    const promise = new Promise<void>((resolve, reject) => {
        request = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (call %init_peer_id% ("getDataSrv" "relay") [] relay)
   (call %init_peer_id% ("getDataSrv" "currentUserName") [] currentUserName)
  )
  (seq
   (seq
    (seq
     (seq
      (seq
       (call %init_peer_id% ("fluence/get-config" "getApp") [] app)
       (seq
        (call relay ("op" "identity") [])
        (call app.$.user_list.peer_id! (app.$.user_list.service_id! "leave") [currentUserName] res)
       )
      )
      (call relay ("op" "identity") [])
     )
     (seq
      (call %init_peer_id% ("fluence/get-config" "getApp") [] app0)
      (seq
       (call relay ("op" "identity") [])
       (call app0.$.user_list.peer_id! (app0.$.user_list.service_id! "get_users") [] allUsers)
      )
     )
    )
    (call relay ("op" "identity") [])
   )s
   (fold allUsers.$.users! user
    (par
     (seq
      (seq
       (call relay ("op" "identity") [])
       (call user.$.relay_id! ("op" "identity") [])
      )
      (call user.$.peer_id! ("fluence/fluent-pad" "notifyUserRemoved") [currentUserName])
     )
     (next user)
    )
   )
  )
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error%])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', 'relay', () => {
                    return client.relayPeerId!;
                });
                h.on('getRelayService', 'hasReleay', () => {
                    // Not Used
                    return client.relayPeerId !== undefined;
                });
                h.on('getDataSrv', 'currentUserName', () => {
                    return currentUserName;
                });

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for leave');
            })
            .build();
    });
    await client.initiateFlow(request);
    return Promise.race([promise, Promise.resolve()]);
}

export async function auth(
    client: FluenceClient,
): Promise<{ err_msg: string; is_authenticated: boolean; ret_code: number }> {
    let request;
    const promise = new Promise<{ err_msg: string; is_authenticated: boolean; ret_code: number }>((resolve, reject) => {
        request = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (seq
    (call %init_peer_id% ("getDataSrv" "relay") [] relay)
    (seq
     (call %init_peer_id% ("fluence/get-config" "getApp") [] app)
     (seq
      (call relay ("op" "identity") [])
      (call app.$.user_list.peer_id! (app.$.user_list.service_id! "is_authenticated") [] res)
     )
    )
   )
   (call relay ("op" "identity") [])
  )
  (call %init_peer_id% ("callbackSrv" "response") [res])
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error%])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', 'relay', () => {
                    return client.relayPeerId!;
                });
                h.on('getRelayService', 'hasReleay', () => {
                    // Not Used
                    return client.relayPeerId !== undefined;
                });

                h.onEvent('callbackSrv', 'response', (args) => {
                    const [res] = args;
                    resolve(res);
                });

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for auth');
            })
            .build();
    });
    await client.initiateFlow(request);
    return promise;
}

export async function getHistory(
    client: FluenceClient,
): Promise<{ entries: { body: string; id: number }[]; err_msg: string; ret_code: number }> {
    let request;
    const promise = new Promise<{ entries: { body: string; id: number }[]; err_msg: string; ret_code: number }>(
        (resolve, reject) => {
            request = new RequestFlowBuilder()
                .disableInjections()
                .withRawScript(
                    `
(xor
 (seq
  (seq
   (seq
    (call %init_peer_id% ("getDataSrv" "relay") [] relay)
    (seq
     (seq
      (seq
       (call %init_peer_id% ("fluence/get-config" "getApp") [] app)
       (seq
        (call %init_peer_id% ("fluence/get-config" "getApp") [] app0)
        (seq
         (call relay ("op" "identity") [])
         (call app0.$.user_list.peer_id! (app0.$.user_list.service_id! "is_authenticated") [] res0)
        )
       )
      )
      (call relay ("op" "identity") [])
     )
     (seq
      (call relay ("op" "identity") [])
      (call app.$.history.peer_id! (app.$.history.service_id! "get_all") [res0.$.is_authenticated!] res)
     )
    )
   )
   (call relay ("op" "identity") [])
  )
  (call %init_peer_id% ("callbackSrv" "response") [res])
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error%])
)

            `,
                )
                .configHandler((h) => {
                    h.on('getDataSrv', 'relay', () => {
                        return client.relayPeerId!;
                    });
                    h.on('getRelayService', 'hasReleay', () => {
                        // Not Used
                        return client.relayPeerId !== undefined;
                    });

                    h.onEvent('callbackSrv', 'response', (args) => {
                        const [res] = args;
                        resolve(res);
                    });

                    h.onEvent('errorHandlingSrv', 'error', (args) => {
                        // assuming error is the single argument
                        const [err] = args;
                        reject(err);
                    });
                })
                .handleScriptError(reject)
                .handleTimeout(() => {
                    reject('Request timed out for getHistory');
                })
                .build();
        },
    );
    await client.initiateFlow(request);
    return promise;
}

export async function addEntry(
    client: FluenceClient,
    entry: string,
    selfPeerId: string,
): Promise<{ entry_id: number; err_msg: string; ret_code: number }> {
    let request;
    const promise = new Promise<{ entry_id: number; err_msg: string; ret_code: number }>((resolve, reject) => {
        request = new RequestFlowBuilder()
            .disableInjections()
            .withRawScript(
                `
(xor
 (seq
  (seq
   (seq
    (seq
     (call %init_peer_id% ("getDataSrv" "relay") [] relay)
     (call %init_peer_id% ("getDataSrv" "entry") [] entry)
    )
    (call %init_peer_id% ("getDataSrv" "selfPeerId") [] selfPeerId)
   )
   (seq
    (seq
     (seq
      (seq
       (seq
        (seq
         (call %init_peer_id% ("fluence/get-config" "getApp") [] app)
         (seq
          (call %init_peer_id% ("fluence/get-config" "getApp") [] app0)
          (seq
           (call relay ("op" "identity") [])
           (call app0.$.user_list.peer_id! (app0.$.user_list.service_id! "is_authenticated") [] res0)
          )
         )
        )
        (seq
         (call relay ("op" "identity") [])
         (call app.$.history.peer_id! (app.$.history.service_id! "add") [entry res0.$.is_authenticated!] res)
        )
       )
       (call relay ("op" "identity") [])
      )
      (seq
       (call %init_peer_id% ("fluence/get-config" "getApp") [] app1)
       (seq
        (call relay ("op" "identity") [])
        (call app1.$.user_list.peer_id! (app1.$.user_list.service_id! "get_users") [] allUsers)
       )
      )
     )
     (call relay ("op" "identity") [])
    )
    (fold allUsers.$.users! user
     (par
      (seq
       (seq
        (call relay ("op" "identity") [])
        (call user.$.relay_id! ("op" "identity") [])
       )
       (call user.$.peer_id! ("fluence/fluent-pad" "notifyTextUpdate") [entry selfPeerId res0.$.is_authenticated!])
      )
      (next user)
     )
    )
   )
  )
  (call %init_peer_id% ("callbackSrv" "response") [res])
 )
 (call %init_peer_id% ("errorHandlingSrv" "error") [%last_error%])
)

            `,
            )
            .configHandler((h) => {
                h.on('getDataSrv', 'relay', () => {
                    return client.relayPeerId!;
                });
                h.on('getRelayService', 'hasReleay', () => {
                    // Not Used
                    return client.relayPeerId !== undefined;
                });
                h.on('getDataSrv', 'entry', () => {
                    return entry;
                });
                h.on('getDataSrv', 'selfPeerId', () => {
                    return selfPeerId;
                });
                h.onEvent('callbackSrv', 'response', (args) => {
                    const [res] = args;
                    resolve(res);
                });

                h.onEvent('errorHandlingSrv', 'error', (args) => {
                    // assuming error is the single argument
                    const [err] = args;
                    reject(err);
                });
            })
            .handleScriptError(reject)
            .handleTimeout(() => {
                reject('Request timed out for addEntry');
            })
            .build();
    });
    await client.initiateFlow(request);
    return promise;
}
