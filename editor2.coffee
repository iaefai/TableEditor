
Editor = (->
	self = {}
	self._start = ->
		table = Table.init(document.querySelector(".table_div"), 6, 6, 1, 1)
		console.log "Table Selector Start"
		return

	self
	)()

document.addEventListener "DOMContentLoaded", Editor._start
