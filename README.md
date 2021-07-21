## AWS CLI commands

```
sam deploy --guided

aws cloudformation describe-stacks \
    --stack-name simple-websocket-chat-app --query 'Stacks[].Outputs'
```

## Testing the chat API
 
``` bash
$ wscat -c wss://e3v3oxocaj.execute-api.eu-central-1.amazonaws.com/staging
connected (press CTRL+C to quit)
> {"action":"sendmessage", "data":"hello world"}
< hello world
```

## TODO

Implement save chat



## Before deploy



Check regulations for saving chat

Add jwt authentication with the same secret as the climbingpartners-backend so we can verify the user
Add cors to check that requests are coming from the frontend
