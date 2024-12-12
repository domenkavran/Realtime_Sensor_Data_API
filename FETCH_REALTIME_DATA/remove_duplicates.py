from utils import create_connection
import time
from datetime import datetime

# Database connection parameters
#database
host_name = "localhost"
database_name = "sensors"
username = "username"
user_password = "password"
table_name = "data"

# Connect to the database
connection = None
while connection is None:
    connection = create_connection(host_name, database_name, username, user_password)
    time.sleep(5)

try:
    print("Deleting duplicated rows...")
    with connection.cursor() as cursor:
        # SQL query to find duplicates
        find_duplicates_query = """
        SELECT sensor_name, timestamp, COUNT(*)
        FROM data
        GROUP BY sensor_name, timestamp
        HAVING COUNT(*) > 1
        """
        
        # Execute the query
        cursor.execute(find_duplicates_query)
        duplicates = cursor.fetchall()
        
        # Process each duplicate
        for duplicate_index, duplicate in enumerate(duplicates):
            if duplicate_index % 100 == 0:
                print(duplicate_index, "/", len(duplicates))
            sensor_name = duplicate[0]
            timestamp = duplicate[1]
            
            # SQL to delete duplicates but keep one with the smallest ID
            delete_duplicates_query = """
            DELETE t1 FROM data t1
            INNER JOIN (
                SELECT MIN(ID) as ID, sensor_name, timestamp
                FROM data
                WHERE sensor_name = %s AND timestamp = %s
                GROUP BY sensor_name, timestamp
            ) t2 ON t1.sensor_name = t2.sensor_name AND t1.timestamp = t2.timestamp
            WHERE t1.ID > t2.ID
            """
            
            # Execute delete query
            cursor.execute(delete_duplicates_query, (sensor_name, timestamp))
        
        # Commit changes
        connection.commit()

finally:
    connection.close()
