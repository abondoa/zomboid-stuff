# Discord bot for GCP

This is a discord bot that allows you to interact with a Zomboid Server via RCON. 

You need to setup a discord bot following the guide from https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot.
The client ID and the token need to be stored in a file named config.json and placed in the docker container. 

```
{
    "host": "<Hostname or IP of the RCON server goes here>",
    "port": <Port for the RCON server>,
    "password": "<Password for the RCON server>",
    "token": "<Token for the discord bot goes here>",
    "clientId": "<Client ID for the discord bot goes here>"
}
```
