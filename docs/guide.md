# Guide

In this guide i will show you what the (current) functions are in script bot

current functions

- say [text]

  - returns [messageId]

- send [channel] , [text]

  - returns [messageId]

- createchannel [name]

  - returns [channelId]

- renamechannel [id] , [name]

  - returns [channelId]

- createrole [name]

  - return [roleId]

- renamerole [id] , [name]

  - returns [roleId]

- str [text]

  - returns [text]

- merge [text] , [text]

  - returns [text]

example:

```bash
# this is how you assign variables
$name str this is a channel
$channel createchannel $name
# The comma after the variable is needed
renamechannel $channel , new name
```

As you can see its pretty easy to make custom scripts and im planning to improve on this in the next couple of days alot!
