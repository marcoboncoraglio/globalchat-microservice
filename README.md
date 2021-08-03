## Usage

``` bash

connect:
$ wscat -c wss://nsy885h83f.execute-api.eu-central-1.amazonaws.com/Staging?chatUrl=google.com

Adds message to existing chat
{
   "action":"sendmessage",
   "message":{
      "chatUrl":"youtube.com",
      "author":"Jeff",
      "text":"hello again"
   }
}
always returns entire message object to people in the same chat room

(might not work yet)
Change room
{
   "action": "changeroom",
   "chatUrl": "google.com"
}

either 200 or 500

```
