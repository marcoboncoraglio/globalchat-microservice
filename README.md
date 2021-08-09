## Usage

``` bash
$ wscat -c wss://nsy885h83f.execute-api.eu-central-1.amazonaws.com/Staging
```

Adds message to existing chat
``` bash
{
   "action":"sendmessage",
   "message":{
      "author":"Jeff",
      "text":"hello again",
      "imgUrl":"imgUrl"
   }
}
```
returns entire body object plus connectionId and chatUrl

Get room count
``` bash
{
   "action":"getroomcount",
   "chatUrl": "google.com"
}
```
returns number of connected users in chatroom


Change room
``` bash
{
   "action": "changeroom",
   "chatUrl": "google.com"
}
```
returns connection acknowlegdement

## Before deploy
Add cors to check that requests are coming from the frontend
