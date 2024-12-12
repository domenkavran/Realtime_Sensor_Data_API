import json
import time
import requests
from datetime import datetime
from dateutil.parser import parse

from utils import create_connection, insert_data

Application = "Application"
APIKey = "API_KEY"
Fields = "up.uplink_message.decoded_payload,up.uplink_message.frm_payload"
NumberOfRecords = 800
URL = "THE_THINGS_NETWORK_URL" + Application + "/packages/storage/uplink_message?order=-received_at&limit=" + str(NumberOfRecords) + "&field_mask=" + Fields
Header = { "Accept": "text/event-stream", "Authorization": "Bearer " + APIKey }

#database
host_name = "localhost"
database_name = "sensors"
username = "username"
user_password = "password"
table_name = "data"

#connect do database
connection = None
while connection is None:
    connection = create_connection(host_name, database_name, username, user_password)
    time.sleep(5)

print("\n\nFetching from data storage...\n")

while(1):
    try:
        r = requests.get(URL, headers = Header)
        JSON = "{\"data\": [" + r.text.replace("\n\n", ",")[:-1] + "]}";
        JSON_obj=json.loads(JSON)

        data_to_upload = []
        for entry in JSON_obj['data']:
            device_id = entry['result']['end_device_ids']['device_id']
            #timestamp = datetime.strptime(entry['result']['received_at'][:-11], '%Y-%m-%dT%H:%M:%S') #too precise, sometimes fails
            timestamp = parse(entry['result']['received_at']) #more forgiving, supports variable format
            timestamp = timestamp.strftime('%Y-%m-%dT%H:%M:%S') #convert datetime object into string that is saved in the DB
            
            payload = entry['result']['uplink_message']['decoded_payload']

            #data
            external_temp = None
            humidity = None
            pressure = None
            temperature = None
            
            if 'externalTemperature' in payload:
                external_temp = float(payload['externalTemperature'])
            if 'humidity' in payload:
                humidity = float(payload['humidity'])
            if 'pressure' in payload:
                pressure = float(payload['pressure'])
            if 'temperature' in payload:
                temperature = float(payload['temperature'])
                
            data_to_upload.append((device_id, timestamp, external_temp, temperature, humidity, pressure))
        
        #sort all tuples in the list based on timestamp
        data_to_upload = sorted(data_to_upload, key=lambda x: x[1])

        #upload data
        insert_data(connection, data_to_upload, table_name, verbose = False)
    except Exception as e:
        print("Error:", e)

    time.sleep(60)