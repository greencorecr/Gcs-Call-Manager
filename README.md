# Q.M.

_Q.M._ is born as a Queue Monitor for asterisk, initially sponsored by Greencore Solutions (http://greencore.co.cr) and Abax Asesores (http://abaxasesores.com/) and released under the aGPL license.

### Features:
* Overview of all queues configured in your asterisk
* Complete responsive HTML interface with live updates.
* Statistics for each queue and each agent (real time only for now).

	* Completed Calls
	* Abandoned Calls
	* Average Hold Time
	* Average Wait Time

* Agent management options

	* Pause/Resume agents in each queue
	* Remove agents from each queue
	* Create a monitoring spychan to a specific extension for any agent

### Technologies

The first version of this project is based on NodeJS, using Express 3, MongoDB, socket.io and the asterisk-ami module by [Holliday Extras](https://github.com/holidayextras), called [node-asterisk-ami](https://github.com/holidayextras/node-asterisk-ami).

## Installation:
Install nodeJS and mongoDB as specified by their instructions, then download this repository and run _npm install_.

##TODO:
1. Finish this ReadMe