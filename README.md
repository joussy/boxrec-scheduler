<a href="https://travis-ci.org/joussy/boxrec-scheduler"><img src="https://travis-ci.org/joussy/boxrec-scheduler.svg?branch=master" alt="Build Status"/></a>

# boxrec-scheduler

Convert BoxRec bouts into iCalendar. Supported format is BoxRec Global Id.

For example Lee Haskins global id is 178678 (http://boxrec.com/boxer/178678). The following sample will convert all his bouts to Ical format:
```javascript
const boxRec = require('boxrec-scheduler').BoxRec;
var boxrec = new boxRec();
boxrec.idstoIcs([178678]).then(icsCalendar => console.log(icsCalendar));
```
You can also generate Json-formatted data.
The following code will display boxer details:
```javascript
const boxRec = require('boxrec-scheduler').BoxRec;
var boxrec = new boxRec();
boxrec.findById(178678).then(boxer => {
  var data = JSON.stringify(boxer, null, 4);
  console.log(data);
});
```
will return information and bouts for Lee Haskins:
```javascript
{  
   "id":178678,
   "name":"Lee Haskins",
   "nickname":"Playboy",
   "birthdate":"1983-11-29T00:00:00.000Z",
   "record":{  
      "w":34,
      "l":3,
      "d":0
   },
   "bouts":[  
      {  
         "titles":[  

         ],
         "date":"2003-03-06T00:00:00.000Z",
         "opponent":{  
            "bouts":[
            ],
            "name":"Ankar Miah"
         },
         "location":"Ashton Gate (Bristol City FC), Bristol, Avon, United Kingdom"
      }
   ]
}
```

* Cache implementation: results are stored in a Json file in order to be replayed instead of querying BoxRec website.
