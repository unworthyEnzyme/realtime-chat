# realtime-chat
An instant messaging app with video chat capabilities. There is work to do on the ui/ux because honestly those weren't by top priority. This is more of a playground
for experimenting with web technologies i am not particulary familiar with like webrtc.
I am planning to add webauthn as an auth mechanism and replace the websocket protocol with the new webtransport protocol(i am not sure i can do this with nodejs though).

## General arthitecture
Server doesn't do much, i only used it for auth, relaying the messages from one client to the another and as a signaling server for the webrtc.
I'm storing the messages on the browser using indexedDB as such there is security implications, I think when i add the webauthn i can use the generated keys for the
encrypting and decrypting. 
There is a `DB` class which extends the `EventTarget` so that i can listen for incoming messages from anywhere in my codebase.
