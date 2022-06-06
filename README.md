# Simulator_Bus_Traffic_Luxembourg
Simulates where and when the buses in Luxembourg are and how they move from one point to another.

**Currently only contains RGTR buslines**
Last Updated: 05/June/2021

Displays a map with markers which represent the different buses.
They move from one stop to another in the time they are given by the timetable, so if a bus should be on stop 1 on 10:00 and on stop 2 at 10:01, it will take exactly 1 minute on the map too for the marker to move.

To load your own data, please save your json data like this (or let xml_reader.py extract it for you from the xml files):
```json
{
 "222": {
   "stops": {
      "LU::ScheduledStopPoint:14300201_RGTR_::": ["LUX Merl, Geesseknäppchen (S)", ["6.11346393869445", "49.6018360501788"]],
      "LU::ScheduledStopPoint:58110401_RGTR_::": ["FENTANGE, Duelemerbach", ["6.15103270868228", "49.5700024130446"]]"
      },
   "links": [
      ["LU::ScheduledStopPoint:14300201_RGTR_::", "LU::ScheduledStopPoint:58110401_RGTR_::"],
      ["LU::ScheduledStopPoint:58110401_RGTR_::", "LU::ScheduledStopPoint:58110301_RGTR_::"]
      ],
   "timetable": [
      ["LU::ScheduledStopPoint:14300201_RGTR_::", "14:25:00"],
      ["LU::ScheduledStopPoint:58110401_RGTR_::", "14:35:00"]
      ]
   }
}
```

xml files for the luxemburgish RGTR lines can be found here: https://data.public.lu/fr/datasets/horaires-et-arrets-des-transport-publics-netex/#_
you will need the netex folder to get the xml files.


