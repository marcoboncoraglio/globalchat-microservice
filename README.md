## AWS CLI commands

```
sam deploy --guided

aws cloudformation describe-stacks \
    --stack-name simple-websocket-chat-app --query 'Stacks[].Outputs'
```

## TODO

``` bash
$ wscat -c wss://e3v3oxocaj.execute-api.eu-central-1.amazonaws.com/staging

Connect to server
wss://e3v3oxocaj.execute-api.eu-central-1.amazonaws.com/staging?chatUrl=your-url

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

Change room
{
   "action": "changeroom",
   "chatUrl": "google.com"
}

either 200 or 500

```

## Before deploy

Check regulations for saving chat

Add cors to check that requests are coming from the frontend
