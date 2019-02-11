var timerID = null
var interval = 100

self.onmessage = (e) => {
	if (e.data === 'start') {
		console.log('MetronomeWorker: start')

		timerID = setInterval(() => {
			postMessage('tick')
		}, interval)
	} else if (e.data.interval) {
		console.log('MetronomeWorker: Lookahead interval = ' + e.data.interval)
		interval = e.data.interval

		if (timerID) {
			clearInterval(timerID)

			timerID = setInterval(() => {
				postMessage('tick')
			}, interval)
		}
	} else if (e.data === 'stop') {
		console.log('MetronomeWorker: stop')
		clearInterval(timerID)
		timerID = null
	}
}

postMessage('MetronomeWorker: Loaded')
