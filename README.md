## AWS CLI commands

```
sam deploy --guided

aws cloudformation describe-stacks \
    --stack-name simple-websocket-chat-app --query 'Stacks[].Outputs'
```

## TODO
 
Message date should be sort key

Look into denormalizing tables

confirm JWT at each message, and extract userId from token? Or is one authentication at connection enough?

``` bash
$ wscat -c wss://e3v3oxocaj.execute-api.eu-central-1.amazonaws.com/staging

Should create a new chat room with 2 participants
{
   "action":"sendmessage",
   "message":{
      "author":"60f970e6d61e5a318f95b326",
      "text":"hello world"
   },
   "newChatRoom":{
      "name":"test chat room",
      "participants":[
         "60f882ff47e408d999e2ae1c",
         "60f970e6d61e5a318f95b326"
      ]
   }
}

Should add message to existing chat
{
   "action":"sendmessage",
   "message":{
      "chatId":"92690160-bc30-4839-9c21-34f27e289873",
      "author":"60f970e6d61e5a318f95b326",
      "text":"hello again"
   }
}

// expiration date 3d
id1: 60f882ff47e408d999e2ae1c
token1: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjg4MmZmNDdlNDA4ZDk5OWUyYWUxYyIsImlhdCI6MTYyNjk3MTkzNiwiZXhwIjoxNjI3MjMxMTM2fQ.ZFRrQFRWxUStz8NR_slrFzq3QhyCSI5hWKY7Zdm9BzY

id2: 60f970e6d61e5a318f95b326
token2: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjk3MGU2ZDYxZTVhMzE4Zjk1YjMyNiIsImlhdCI6MTYyNjk3MTk5NCwiZXhwIjoxNjI3MjMxMTk0fQ.xfuwwRuxQzxKIYbX7BMDAdOHX05oicz3l5HTRX7xwdU
```

## Before deploy

Check regulations for saving chat

Add cors to check that requests are coming from the frontend
