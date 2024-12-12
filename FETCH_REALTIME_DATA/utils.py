import mysql.connector
from mysql.connector import Error
from sshtunnel import SSHTunnelForwarder

def create_connection(host_name, database_name, user_name, user_password):
    """Create a database connection and return the connection object."""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            database=database_name,
            user=user_name,
            password=user_password,
            connection_timeout=60000
        )
        print("Connection to MySQL DB successful\n")
    except Error as e:
        print("The error '{}' occurred\n".format(e))
    
    return connection

def insert_data(connection, data_to_insert, table_name, verbose = False):
    """Insert data into the table if the sensor_name and timestamp do not already exist."""
    cursor = connection.cursor()
    
    for data in data_to_insert:
        sensor_name, timestamp, external_temperature, temperature, humidity, pressure = data
        
        # Check if the sensor_name and timestamp already exist
        query_check = """SELECT EXISTS(SELECT 1 FROM {} WHERE sensor_name = %s AND timestamp = %s)""".format(table_name)
        cursor.execute(query_check, (sensor_name, timestamp))
        
        if cursor.fetchone()[0] == 0:  # If the row does not exist
            # SQL query to insert data
            query_insert = """INSERT INTO {} (sensor_name, timestamp, external_temperature, temperature, humidity, pressure)
                               VALUES (%s, %s, %s, %s, %s, %s)""".format(table_name)
            cursor.execute(query_insert, (sensor_name, timestamp, external_temperature, temperature, humidity, pressure))
            connection.commit()
            if verbose is True:
                print("Data inserted for sensor_name: {} at timestamp: {}\n".format(sensor_name, timestamp))
        else:
            if verbose is True:
                print("Data for sensor_name: {} at timestamp: {} already exists.\n".format(sensor_name, timestamp))
    
    cursor.close()