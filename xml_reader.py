from bs4 import BeautifulSoup
import concurrent.futures
import os
import json


DEPENDENCIES = ["beautifulsoup4", "lxml", "json", "os", "concurrent.futures"]

folder : str = os.path.abspath("data/netex/RGTR_RGTR/")
output_file : str = "data/lines.json"
bus_instances : dict = {}


class Bus():
    def __init__(self, file : str) -> None:
        self.name : str = None
        self.stops : dict = {}
        self.links : list = []
        self.timetable : list = []
        self.journey_stops : dict = {}
        self.data : str = None
        self.file : str = file
        self.dict_repr : dict = {self.name: {"stops": self.stops, "links": self.links, "timetable": self.timetable}}
        self.simple_dict_repr : dict = {"stops": self.stops, "links": self.links, "timetable": self.timetable}

        print("Starting self.build()")
        self.build()


    def __repr__(self) -> str:
        return json.dumps(self.dict_repr)

    
    def build(self):
        """Gets all the information about the busline from the file"""

        with open(self.file, "r", encoding="utf-8") as _file:
            self.data = _file.read()

        self.document = BeautifulSoup(self.data, "xml")

        ## Get data
        print("Getting self.name")
        self.get_name()
        print(f"[{self.name}]: get_stops()")
        self.get_stops()
        print(f"[{self.name}]: get_links()")
        self.get_links()
        print(f"[{self.name}]: get_journey_stops()")
        self.get_journey_stops()
        print(f"[{self.name}]: get_timetable()")
        self.get_timetable()

        return self.dict_repr

    
    def get_name(self) -> str:
        busline = self.document.find("lines")
        self.name = str(busline.find("Name").text)
        print(self.name)

        return self.name


    def get_stops(self) -> dict:
        """
        Get all stop points the bus stops at during its journey. \n
        ex.:
            {"LU::ScheduledStopPoint:26740101_RGTR_::": [
                "LUX Kirchberg, Rehazenter", ["6.17382204419255", "49.6285255538388"]]}
        """

        stop_points = self.document.find_all("ScheduledStopPoint")

        for stop_point in stop_points:
            location = stop_point.find("Location")
            longitude = location.find("Longitude").text
            latitude = location.find("Latitude").text
            name = stop_point.find("ShortName").text
            identifier = stop_point.get('id')
            self.stops[identifier] = [name, [longitude, latitude]]
        
        return self.stops

    
    def get_links(self) -> list:
        """ 
        Get all the links between the stop points \n
        So from which stop point to which the bus drives \n
        ex.:
            [[1, 2], [2, 3]] \n
            The bus drives from point 1 to point 2 \n
            and then from point 2 to point 3
        """

        service_links = self.document.find_all("ServiceLink")
        
        for link in service_links:
            _from = link.find("ToPointRef").get("ref")
            _to = link.find("FromPointRef").get("ref")

            self.links.append([_from, _to])

        return self.links

    
    def get_journey_stops(self) -> dict:
        """
        Gets all the stops in journey like 'get_stops()' but they have different names. \n
        By doing this we can later on look in this dict an know which point corresponds to which stop point. \n
        ex.: {"Journey_Stop_1": "Stop_Point_1} \n
        its just because they refer to them with different names in the timetable, but we want to keep one name.
        """
        stops_in_journey_pattern = self.document.find_all("StopPointInJourneyPattern")

        for stop in stops_in_journey_pattern:
            original_stop = stop.find("ScheduledStopPointRef").get("ref")
            journey_stop = stop.get("id")
            self.journey_stops[journey_stop] = original_stop

        return self.journey_stops


    def get_timetable(self) -> list:
        """Get the time on which the bus has to be on a stop"""

        timetables = self.document.find_all("TimetabledPassingTime")

        for timetable in timetables:
            departure_time = timetable.find("DepartureTime")
            arrival_time = timetable.find("ArrivalTime")
            if  departure_time == None:
                time = arrival_time.text
            elif departure_time != None:
                time = departure_time.text

            journey_location = timetable.find("StopPointInJourneyPatternRef").get("ref")
            self.timetable.append([self.journey_stops[journey_location], time])

        return self.timetable



def main():
    files = [str(os.path.abspath(folder) + "/" + file) for file in os.listdir(folder)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_class = {executor.submit(Bus, _file): _file for _file in files}

    for future in concurrent.futures.as_completed(future_to_class):
        res = future.result()
        if len(res.simple_dict_repr["stops"]) > 0: ## avoid having empty lines
            bus_instances[res.name] = res.simple_dict_repr


    with open(output_file, "w", encoding="utf-8") as _file:
        json.dump(bus_instances, _file, ensure_ascii=False)
        


main()


