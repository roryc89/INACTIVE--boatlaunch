//Boatlaunch (smartbook implementation)

//The following configuration variables (declared by smartbook.js) can be modified here
strErrorEmail = "support@boatlaunch.co.uk"



function boatlaunch_resetMap(strArea)
{
	if (map)
	{
		switch(strArea)
		{
			case "UK":
				map.setCenter(new GLatLng(55.0,-5.0), 4);
				break;
				
			case "Ireland":
				map.setCenter(new GLatLng(54.0, -8.0), 5);
				break;
			
			case "Scotland":
				map.setCenter(new GLatLng(58.0, -4.0), 5);
				break;				
				
			case "Wales":
				map.setCenter(new GLatLng(52.5, -4.0), 6);
				break;		
				
			case "France":
				map.setCenter(new GLatLng(47.0, 1.0), 5);
				break;	

		}
	}
}