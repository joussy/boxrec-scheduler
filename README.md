# boxrec-scheduler
Convert BoxRec bouts into iCalendar

Example:

http://localhost:3000/?boxerids=372003,609795,742000,319725

will return all the bouts from the Global Ids specified as parameters

* Cache implementation: results are stored in a Json file in order to be replayed instead of querying BoxRec website.