import csv
import json

def convert(fileName):
	csvfile = open("%s.csv"% fileName, 'r')
	jsonfile = open("src/%s.json"% fileName, 'w', encoding='utf-8')


	reader = csv.DictReader( csvfile)
	a = []
	for row in reader:
		a.append(row)
	json.dump(a, jsonfile,ensure_ascii=False)
	jsonfile.write('\n')

convert("mies")
convert("nainen")
