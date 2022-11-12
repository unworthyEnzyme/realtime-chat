# realtime-chat
An instant messaging app with video chat capabilities. There is work to do on the ui/ux because honestly those weren't our top priority. This is more of a playground
for experimenting with web technologies we are not particulary familiar with like webrtc.
We are planning to add webauthn as an auth mechanism and replace the websocket protocol with the new webtransport protocol(i am not sure i can do this with nodejs though).

## General arthitecture
Server doesn't do much, We only used it for auth, relaying the messages from one client to the another and as a signaling server for the webrtc.
Messages are stored on the browser using indexedDB and as such there is security implications, I think when we add the webauthn we can use the generated keys for the
encrypting and decrypting. 
There is a `DB` class which extends the `EventTarget` so that i can listen for incoming messages from anywhere in my codebase.

# Trying out the app
Install the dependencies:
```bash
pnpm install
```
Starting the server:
```bash
cd apps/server
pnpm migrate:dev
pnpm dev
```
Starting the client:
```bash
cd apps/client
pnpm dev
```
And go to `/app/chats`
