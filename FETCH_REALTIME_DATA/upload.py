import json
import sys
from datetime import datetime

from utils import create_connection, insert_data

host_name = "localhost"
database_name = "sensors"
username = "username"
user_password = "password"
table_name = "data"
    

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python upload.py <file_path>")
    else:
        file_path = sys.argv[1]

        #connect do database
        connection = create_connection(host_name, database_name, username, user_password)

        if connection is not None:
            try:
                #read file
                with open(file_path, 'r') as file:

                    data_to_upload = []
                    for line_index, line in enumerate(file, start=1):
                        if line_index % 100 == 0:
                            print("Working on line #", line_index)

                        line = line.rstrip('\n')
                        try:
                            json_data = json.loads(line)

                            for entry in json_data['data']:
                                device_id = entry['result']['end_device_ids']['device_id']
                                timestamp = datetime.strptime(entry['result']['received_at'][:-4], '%Y-%m-%dT%H:%M:%S.%f')
                                payload = entry['result']['uplink_message']['decoded_payload']

                                #data
                                external_temp = float(payload['externalTemperature'])
                                humidity = float(payload['humidity'])
                                pressure = float(payload['pressure'])
                                temperature = float(payload['temperature'])
                                
                                data_to_upload.append((device_id, timestamp, external_temp, temperature, humidity, pressure))
                        
                        except Exception as e:
                            print("Error converting line to JSON: {}".format(e))

                #sort all tuples in the list based on timestamp
                data_to_upload = sorted(data_to_upload, key=lambda x: x[1])

                #upload data
                insert_data(connection, data_to_upload, table_name)
            except FileNotFoundError:
                print("File not found: {file_path}".format(file_path))
            except Exception as e:
                print("An error occurred: {e}".format(e))