#from urllib import urlencode
from httplib2 import Http
import json
import sys
import base64

print("Running endpoint Tester....\n")
address = 'http://localhost:5000'


 #TEST 1 TRY TO MAKE A NEW USER
try:
	url = address + '/nimet'
	h = Http()
	data = { "arvioija": "Lasse",
		"nimet": [
		{"nimi": "Ville",
		 "pisteet": 20,
		 "sukupuoli": 'm'}] }
	resp, content = h.request(url,'POST', body = json.dumps(data), headers = {"Content-Type" : "application/json"})
	if resp['status'] != '200':
		raise Exception('Received an unsuccessful status code of %s' % resp['status'])
except Exception as err:
	print ("Test 2 FAILED: Could not add a new task")
	print (err.args)
	sys.exit()
else:
	print ("Test 2 PASS: Succesfully made a new task")
