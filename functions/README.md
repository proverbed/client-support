##Create order 

* instrument
* type [buy/sell]
* 

ENTER|EURUSD|Buy|[Size:0.50]|[Entry:1.10412]|[SL:1.10361 [51 Pips]]|[TP:No TP ]|[Risk:25.50]|[Ticket:2207593253]|[Balance:5199 USD]|[magic:0]
MODIFIED|EURUSD|Buy[SL:1.10384][TP:No TP ][Risk:13.00][Ticket:2207587496][magic:0]
EXIT|EURUSD|Buy|[Size:0.50][Ticket:2207586250][magic:0][Profit:-9.50]



ENTER|EURUSD|Sell|[Size:0.50]|[Entry:1.10391]|[SL:1.10451 [60 Pips]]|[TP:No TP ]|[Risk:30.00]|[Ticket:2207584247]|[Balance:5209 USD]|[magic:0]
MODIFIED|EURUSD|Sell[SL:1.10439][TP:No TP ][Risk:24.00][Ticket:2207584247][magic:0]
MODIFIED|EURUSD|Sell[SL:1.10434][TP:No TP ][Risk:21.50][Ticket:2207584247][magic:0]
EXIT|EURUSD|Buy|[Size:0.50][Ticket:2207586250][magic:0][Profit:-9.50]


@TODO

* add the seperators to the EA for modified and exit 
* keep the ticket the same for the exit, for now, until I can find a way to link the data correctly. 
* create another magic - and test saving to different account 
 


## Configure Emulator 

https://firebase.google.com/docs/emulator-suite/install_and_configure

https://stackoverflow.com/questions/52247445/how-do-i-convert-a-firestore-date-timestamp-to-a-js-date



### ENTER 

`ENTER|EURUSD|Sell|[Size:0.50]|[Entry:1.10391]|[SL:1.10451 [60 Pips]]|[TP:No TP ]|[Risk:30.00]|[Ticket:2207584247]|[Balance:5209 USD]|[magic:1235]`

### MODIFY

`MODIFIED|EURUSD|Sell|[SL:1.10439]|[TP:No TP ]|[Risk:24.00]|[Ticket:2207584247]|[magic:1235]`

### EXIT 

`EXIT|EURUSD|Buy|[Size:0.50]|[Ticket:2207586250]|[magic:0]|[Profit:-9.50]`


#### How to start the firebase emulator locally 

`firebase emulators:start`


CD INTO FUNCTIONS DIRECTORY 

RUN EMULATOR 

`npm run serve`


I dont need to do hosting. 

Just run the web server normally

`npm run dev`

Everything else is handled here.  
* Auth 
* Firestore 
* Functions