## Usage

``` bash
<<<<<<< HEAD
$ wscat -c wss://nsy885h83f.execute-api.eu-central-1.amazonaws.com/
=======

connect:
$ wscat -c wss://nsy885h83f.execute-api.eu-central-1.amazonaws.com/Staging?chatUrl=google.com
>>>>>>> 49d8574e4172d37c56a023de350219d482ecca1f

Adds message to existing chat
{
   "action":"sendmessage",
   "message":{
      "chatUrl":"youtube.com",
      "author":"Jeff",
      "text":"hello again",
      "imgUrl":"imgUrl"
   }
}
always returns entire message object plus connectionId

(might not work yet)
Change room
{
   "action": "changeroom",
   "chatUrl": "google.com"
}

either 200 or 500

```
<<<<<<< HEAD

## Before deploy

Add cors to check that requests are coming from the frontend
=======
>>>>>>> 49d8574e4172d37c56a023de350219d482ecca1f
