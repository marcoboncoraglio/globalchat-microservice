## AWS CLI commands

```
sam deploy --guided

aws cloudformation describe-stacks \
    --stack-name simple-websocket-chat-app --query 'Stacks[].Outputs'
```

## USAGE

``` bash
$ wscat -c wss://nsy885h83f.execute-api.eu-central-1.amazonaws.com/

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

## Before deploy

Add cors to check that requests are coming from the frontend
