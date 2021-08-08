## Usage

``` bash
$ wscat -c wss://nsy885h83f.execute-api.eu-central-1.amazonaws.com/Staging
```

connect should return connectionId (not sure if I have to explicity pass it into the socket or if it can be retured from function)

Adds message to existing chat
``` bash
{
   "action":"sendmessage",
   "message":{
      "chatUrl":"youtube.com",
      "author":"Jeff",
      "text":"hello again",
      "imgUrl":"imgUrl"
   }
}
```
always returns entire body object plus connectionId attached to message


``` bash
Change room
{
   "action": "changeroom",
   "chatUrl": "google.com"
}
```
changeroom should return roomcount (not sure if I have to explicity pass it into the socket or if it can be retured from function)

## Before deploy
Add cors to check that requests are coming from the frontend
