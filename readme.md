How to setup install `deno`

Put tokens a the settings.ts file

```ts
export const botName = 'scriptbot';
export const dbcon = {
	hostname: 'localhost',
	user: 'postgres',
	database: 'postgres',
	port: 5432,
};
export const tokens = {
	dev: '',

	dev: '',

	error: {
		id: 0n,
		token: '',
	},

	logs: {
		id: 0n,
		token: '',
	},
};
```

create a postgressql table with the following [items](https://gist.github.com/SkyBlockDev/ac029429f86e3a8c7562e99b690aea2a)

for current goals view the projects page https://github.com/SkyBlockDev/script-bot/projects/1
