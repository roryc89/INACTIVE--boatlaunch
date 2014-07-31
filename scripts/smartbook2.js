/*
====================================================
#
#   Boatlaunch ltd
#   Copyright 2006
#
#   Original Author:        Paul Bullivant - www.ittium.com
#   Original Date Created:  2006
#
#   Description:
#       Client Side code for use with Smartbook projects
#
#
#   $Author: paul $
#   $Date: 2008/10/06 08:55:53 $
#   $Revision: 1.2 $
#
====================================================
*/

/*
Points to note:
- Cannot generate the DIV tag and call google maps javascript from within the XSL template.
- Cannot split the DIV tag and call to google maps javascript between aspx and XSL template.
- Javascript call in ASPX cannot see the DIV tag generated in the XSL.

- There is general interoperability between XSL and ASPX javascript but failure when creating a MAP object in XSL,
even if calling the same javascript function to do the map creation!!

- The order in which the map DIV, map creation and map dependent functions are called is important for the
successful building of the web page.


Naming Convention

Functionality to do with the map begins with

map_		Functionality displaying and handling the google map
fil_		Functionality displaying and handling the filters
ind_		Functionality displaying the index list
err_		Error handling functionality
inf_		Functionality displaying information to the user
ajx_		Functionality dealing with AJAX calls to the server
art_		Functionality displaying the article
nav_		General Functionality
tre_		Javascript Tree functionality
ind_		Index Functionality

//TODO: Can/Should we create our own classes?

Function flow:

//User toggles filter on
//------------------------------------------
//
//Filter added to array
//fil_processFilters() called
//- ajx_getMapData(FilterID) called
//	map_addOverlays() called (loops through XMLData and plots markers)
//
//- nav_getNavData(FilterID) called
//- ind_updateIndex(request) called
//
//
//User toggles filter off
//------------------------------------------
//
//fil_clearFilter(FilterID) called
//- fil_clearFilterMarkers(FilterID) called
//-- 
//
//- ind_clearAllIndex called
//-- nav_getNavData(All Filters) called
//-- ind_updateIndex(request) called
//
//
//User moves map
//------------------------------------------
//map_updateMap
//ajx_getMapData(All Filters)
//map_addOverlays()
//map_AddMarker
//
//User clicks on Article Link
//------------------------------------------
//ajx_getArticle(intID,iOverlaySwitch) OR ajx_getArticleByName(strName,iOverlaySwitch)
//ajx_getArticleSendRequest		(SENDS AJAX)
//	ajx_checkReturnedRequest(request)		(validates the returned AJAX)
//	ajx_extractXMLData(validRequest)
//art_displayArticle
//	Display article HTML in article DIV	
//art_showArticleOnMap(validRequest, iOverlaySwitch)
//	map_addOverlays()
//	map_handleOverlaySwitch(lat, lng, iOverlaySwitch)
//
//
//	Possible scenarios that might lead us to this function
//	1) Article is requested from index.
//	2) Article is requested from map icon
//	3) Article is requested from hyperlink URL
//	4) Article is displayed and user wants to center on article location.
//	5) Article is displayed and user wants to zoom on article location.

*/


//Page Name
var cstrMainPage = "index.aspx"

//DIV IDs
var cstrDivMapID = "divMap";
//var cstrDivNavID		= "nav";
var cstrDivIndexID = "index"; 	//TODO - Remove this
var cstrDivInfoID = "info";
var cstrDivControlsID = "controls";
var cstrDivErrID = "error";
var cstrDivSearchID = "searchtext";
var cstrDivSearchButtonID = "searchbutton";
var cstrDivTabsID = "divTabs";
var cstrDivArticleID = "divArticle";

// ----------------------------
// Display Panes
// ----------------------------



var cintNumberPanes = 3;
var gintCurrentPane = -1;
var aPane = new Array(cintNumberPanes);

//Each member of aPaneDivs contains a vector of strings.
//The strings are the names of DIVs defined in index.aspx
var aPaneDivs = new Array(cintNumberPanes);


var cintArticlePane = 0;
var cintResultsPane = 1;
var cintPreferencesPane = 2;

aPane[cintArticlePane] = "article";
aPane[cintResultsPane] = "results";
aPane[cintPreferencesPane] = "prefs";

cintFilterList = 1;
cintSearchList = 2;


//TODO - Change to Vector so that we dont have to declare cintNumberDivs
var cintNumberDivs = 5;
var aDivs = new Array(cintNumberDivs); 	//The names of the DIVS
var aDivToolbars = new Array(cintNumberDivs); 	//The toolbar items for each DIV

aDivs[0] = cstrDivMapID;
aDivs[1] = cstrDivArticleID
aDivs[2] = "divResults";
aDivs[3] = "divFilter";
aDivs[4] = "divSearch";



// ----------------------------
// Toolbar
// ----------------------------
var toolbar = null;

//Variables for capturing article information
//used by toolbar clicks
var intXMLNodeID = 0;
var intXMLPreferredFilterID = 0;
var strXMLLink = "";
var strXMLEmailLink = "";
var strXMLName = "";

//Constants used to decide if a text button, image button or both is required.
var cintToolbarTextButton = 1;
var cintToolbarImageButton = 2;


// ------------------------
// Google AdSense
// ------------------------
var strXMLKeywords = "";
var cintAdvertHeight = 100;
var cintAdvertWidth = 100;



// ----------------------------
// Article Submit Button
// ----------------------------
var cstrCheckBoxTermsAndConditions = "ckbTerms";
var cstrSubmit = "submitbutton"


// ----------------------------
// AJAX Data
// ----------------------------

//Query Strings and Parameters
var cstrRequestPage = "dataRequest.aspx";
var cstrMapDataRequestPage = cstrRequestPage + "?type=mapdata";
var cstrArticleRequestPage = cstrRequestPage + "?type=article";
var cstrNavDataRequestPage = cstrRequestPage + "?type=navdata";
var cstrListDataRequestPage = cstrRequestPage + "?type=list";
var cstrSearchDataRequestPage = cstrRequestPage + "?type=search";

var cstrNodeIDField = "nodeid";
var cstrFilterField = "filters"
var cstrMinLatField = "minlat";
var cstrMaxLatField = "maxlat";
var cstrMinLongField = "minlong";
var cstrMaxLongField = "maxlong";
var cstrZoomField = "zoom";
var cstrCentreLatField = "centrelat";
var cstrCentreLngField = "centrelng";
var cstrPreferredFilterIDField = "preferredfilterid";
var cstrSearchField = "search"

//Results Pane
var cintListPageSize = 10;
var gintResultsPageNumber = 1;
var gintResultsNumberPages = 0;
var gintResultsNumberArticles = 0;

var cstrFilterDelimiter = "-";

//Data Extracted from returned AJAX XML
var ciXMLNumberFields = 10;

var aXMLData = new Array(ciXMLNumberFields);
var aXMLFieldTags = new Array(ciXMLNumberFields);

var ciXMLNodeIDIndex = 0;
var ciXMLNameIndex = 1;
var ciXMLLngIndex = 2;
var ciXMLLatIndex = 3;
var ciXMLFilterIDIndex = 4;
var ciXMLFilterNameIndex = 5;
var ciXMLIconIndex = 6;
var ciXMLHandlerIndex = 7;
var ciXMLActionIndex = 8;
var ciXMLHTMLIndex = 9;

//This stores the number of nodes found in the last AJAX request
var gintXMLDataSize = 0;

//AJAX XML Tags returned by server
aXMLFieldTags[ciXMLNodeIDIndex] = "nodeid";
aXMLFieldTags[ciXMLNameIndex] = "name";
aXMLFieldTags[ciXMLLngIndex] = "longitude";
aXMLFieldTags[ciXMLLatIndex] = "latitude";
aXMLFieldTags[ciXMLFilterIDIndex] = "filterid";
aXMLFieldTags[ciXMLFilterNameIndex] = "filtername";
aXMLFieldTags[ciXMLIconIndex] = "filtericon";
aXMLFieldTags[ciXMLHandlerIndex] = "handlerOnClick";
aXMLFieldTags[ciXMLActionIndex] = "actionOnClick";
aXMLFieldTags[ciXMLHTMLIndex] = "html";

//AJAX XML Root Node Tags
var cstrArticleRootNode = "article";
var cstrListRootNode = "itemlist";
var cstrInfoRootNode = "info";

//Paging Tags
var cstrPageNumberTag = "pagenumber";
var cstrNumberPagesTag = "numberpages";
var cstrNumberArticlesTag = "numberarticles";


//Indicators
var cintIndicatorArticle = 1;
var cintIndicatorMap = 2;
var cintIndicatorList = 3;



// ----------------------------
// Javascript Tree Constants
// ----------------------------
var cstrGreyTick = "/images/icons/treeicons/greytick.gif";
//TODO - replace string literal in filter_icons.js
//var cstrTick		= "/images/icons/treeicons/tick.gif";
var cstrBox = "/images/icons/treeicons/box.gif";

// ----------------------------
// Click Handling
// ----------------------------
var cintContextMap = 1;
var cintContextExternal = 2;
var cintContextResultsPane = 3;
var cintContextIndex = 4;


// ----------------------------
// Google Maps Constants
// ----------------------------

//Google Map Overlay Switches
var ciOverlayDoNothing = 0;
var ciOverlayCentre = 1;
var ciOverlayZoom = 2;
var ciOverlayPartialZoom = 4;
var ciOverlayShowInfo = 8;


//Google Map Config
var cintMinimumZoomToAddMarker = 17;
var cintPartialZoomLevel = 10;
var cintZoomInStep = 3;

//Map Type
var iAddMap = 1;
var iBrowseMap = 2;

//Default to Browse Map
var iMapType = iBrowseMap;


var cstrGoogleMapShadowImage = "http://www.google.com/mapfiles/shadow50.png";


//Marker Storage
var aMarkers = new Array(3);

var ciNodeIndex = 0;
var ciMarkerIndex = 1;
var ciFilterIndex = 2;

aMarkers[ciNodeIndex] = new Vector(0);     //Vector contains Node IDs
aMarkers[ciMarkerIndex] = new Vector(0);     //Vector contains Markers
aMarkers[ciFilterIndex] = new Vector(0);     //Vector contains Vector of Filter IDs.


//Configuration Variables (Can be modified by implementations of smartbooks)
//--------------------------------------------------------------------------
var strErrorEmail = "support@boatlaunch.co.uk";

//Map starting Coordinates
var decInitialLng = -5.0;
var decInitialLat = 55.0;
var intInitialZoom = 5;
var cstrErrorBoxHeight = "50px";

//handler and Actions for article/icon clicks/
//TODO - Make these correspond to VB constants more tightly
var cintHandlerClientScript = 0;
var cintHandlerServerPopUp = 1;
var cintActionDisplayArticle = 0;


//Cookie Variables
var cookieDurationHours = 24;
var cookieExpiryDate = new Date();
FixCookieDate(cookieExpiryDate); // Correct for Mac date bug - call only once for given Date object!
cookieExpiryDate.setTime(cookieExpiryDate.getTime() + (cookieDurationHours * 60 * 60 * 1000));


//Information Display
var iInfoLines = 1;
var aInfoLines = new Array(iInfoLines);
for (var i = 0; i < aInfoLines.length; i++) {
    aInfoLines[i] = "";
}

var infoOverlay;

//Prepare Vectors and Arrays
var aIconName = new Vector(0);              //Vector contains the names of the icons we already know
var aIconObject = new Vector(0);
var aLongitudeFields = new Array();
var aLatitudeFields = new Array();


//Global Variables
var map;

var imageIcon;
var shadowIcon;
var mapMarkers = [];

//This stores an array of active filters.
//This array is independent from the list of selected filters
//used in the filter tree.  Any changes made to the filter tree
//call nav_toggleFilter which updates aFilters and then triggers
//any updates needed elsewhere e.g. map, index, results pane
var aFilters = new Vector(0);

// --------------------------------------------------------------------------------------------------


// ---------------------------
// MAP FUNCTIONALITY
// ---------------------------


//This function must be called first before any other map functions.
//a <DIV id="map"> must exist before this function is called
function map_drawMap() {
    //DEBUG
    //alert("drawmap");

    if (map_checkCompatible()) {

        ////map = new GMap2(document.getElementById(cstrDivMapID));

        // Check for coordinates in cookie
        var zoom = parseInt(GetCookie(cstrZoomField));
        var centreLat = parseFloat(GetCookie(cstrCentreLatField));
        var centreLng = parseFloat(GetCookie(cstrCentreLngField));
        var myLatlng = new google.maps.LatLng(centreLat, centreLng);
        if (isNaN(zoom)) {
            zoom = intInitialZoom;
        }
        var myOptions = {
            zoom: zoom,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        map = new google.maps.Map(document.getElementById(cstrDivMapID), myOptions);

        //Check for coordinates in cookie
        var zoom = parseInt(GetCookie(cstrZoomField));
        var centreLat = parseFloat(GetCookie(cstrCentreLatField));
        var centreLng = parseFloat(GetCookie(cstrCentreLngField));

        if (centreLat && centreLng) {
            //Zoom to memorised position
            map.setCenter(new google.maps.LatLng(centreLat, centreLng));
            map.setZoom(zoom);
        }
        else {
            map_resetMap();
        }

        //Now Prepare for map icons

        imageIcon = new google.maps.MarkerImage('',
              new google.maps.Size(20, 34),
              new google.maps.Point(9, 34),
              new google.maps.Point(9, 2));
        shadowIcon = new google.maps.MarkerImage(cstrGoogleMapShadowImage,
        // The shadow image is larger in the horizontal dimension
        // while the position and offset are the same as for the main image.
      new google.maps.Size(37, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(18, 25));


        //baseIcon = new GIcon();

        //baseIcon.iconSize = new GSize(20, 34);
        //baseIcon.iconAnchor = new GPoint(9, 34);
        //baseIcon.infoWindowAnchor = new GPoint(9, 2);

        //baseIcon.shadow = cstrGoogleMapShadowImage;
        //baseIcon.shadowSize = new GSize(37, 34);
        //baseIcon.infoShadowAnchor = new GPoint(18, 25);

    }
}

function map_checkCompatible() {

    //var isCompatible = GBrowserIsCompatible();
    var isCompatible = true;
    if (!isCompatible) {

        //Google Maps is not supported by this browser.
        //Display information to the user to let them know this.
        var mapDiv = document.getElementById(cstrDivMapID);


        var strHTML = "";

        strHTML += "<p class='mapnotsupported'>We are sorry but Google Maps is not supported by your browser<br />";
        strHTML += "<a target='_blank' href='http://local.google.com/support/bin/answer.py?answer=16532&topic=1499'>";
        strHTML += "See the list of supported browsers";
        strHTML += "</a><br /><br />";
        strHTML += "Please use the filters and indexes instead.</p>";

        mapDiv.innerHTML = strHTML;

        //err_systemError("map_drawMap","Browser is not compatible with Google Maps");
    }

    return isCompatible;
}


//Set a local global flag to indicate what type of map this is.
//The type of map will affect later functionality
function map_setMapType(strMapType) {
    //DEBUG
    //inf_displayInfo("Setting Map type to " + strMapType);

    switch (strMapType) {
        case "add":
            iMapType = iAddMap;
            break;

        case "browse":
            iMapType = iBrowseMap;
            break;
    };
}

function map_resetMap() {
    if (map) {
        map.setCenter(new google.maps.LatLng(decInitialLat, decInitialLng));
        map.setZoom(intInitialZoom);     
    }
}

function map_setDefaultCoordinates(decLat, decLng, intZoom) {
    decInitialLat = decLat;
    decInitialLng = decLng;
    intInitialZoom = intZoom;   
}

//Add generic functionality to the map.

function map_addEventListeners() {
    if (map) {

        // GEvent.addListener(map, "zoomend", map_endZoom);
        //GEvent.addListener(map, "moveend", map_updateMap);
        //GEvent.addListener(map, 'click', function (overlay, latlng) { map_clickHandler(overlay, latlng); });

        google.maps.event.addListener(map, 'zoom_changed', map_endZoom);
        google.maps.event.addListener(map, "dragend", map_updateMap);
        google.maps.event.addListener(map, 'click', function (event) { map_clickHandler(event.latLng); });

    }
    else {
        if (map_checkCompatible()) {
            //Map is comptiable, something else has gone wrong.
            err_systemError("map_addEventListeners", "Map not defined");
        }
    }
}

function map_endZoom() {

    map_clearAllMarkers();
    map_updateMap();
}


//Show/Hide Map
//function map_hideMap() {document.getElementById(cstrDivMapID).style.visibility="hidden"; }
//function map_showMap() {document.getElementById(cstrDivMapID).style.visibility="visible";}
function map_hideMap() { pne_hideDiv(cstrDivMapID); }
function map_showMap() { pne_showDiv(cstrDivMapID); }


//Add basic map controls
function map_addControls() {
    if (map) {

        //map.addControl(new GLargeMapControl());
        //	map.addControl(new GMapTypeControl());

        //Additional Controls
        //	map.addControl(new GSmallMapControl());
        //map.addControl(new GSmallZoomControl());

        //	map.addControl(new GOverviewMapControl());
    }
    else {
        if (map_checkCompatible()) {
            //Map is comptiable, something else has gone wrong.
            err_systemError("map_addControls", "Map not defined");
        }

    }
}

// General handling of clicks on the map.
// This does not handle marker specific clicks with their
// own individual handler functionality
function map_clickHandler(latlng) {
    if (map) {
        var maxZoomService = new google.maps.MaxZoomService();

        var mapZoom = map.getZoom();
        //var mapType = map.getCurrentMapType();
        var mapType = map.getMapTypeId();

        var maxZoom = 16;
        maxZoomService.getMaxZoomAtLatLng(latlng, function (response) {
            if (response.status == google.maps.MaxZoomStatus.OK) {
                maxZoom = response.zoom;
            }
        });



        // mapType.getMaximumResolution(overlay.latlng);

        //DEBUG
        //inf_displayInfo("mapZoom = " + mapZoom);
        //inf_displayInfo("maxZoom = " + maxZoom);
        //inf_displayInfo("latlng = " + latlng.lat() + "," + latlng.lng());


        // Processing for an 'Add' Map
        if (iMapType == iAddMap) {
            if (latlng) {

                //User wants to add a marker.
                //Make sure we're zoomed in enough first.

                if (mapZoom < maxZoom) {

                    if (mapZoom < (maxZoom - cintZoomInStep)) {
                        //TODO By calling centerandZoom, we end up activating teh moveend listener twice and thus end up doing two map AJAX calls
                        //TODO - Does this still apply now that we have moved to API v2
                        map.setCenter(latlng);
                        map.setZoom(mapZoom + cintZoomInStep);
                    }
                    else {
                        map.setCenter(latlng);
                        map.setZoom(maxZoom);
                    }

                    //Plot a marker if needs be
                    map_plotLinkedFields();
                }
                else {

                    //Move the Marker to the new point

                    //TODO - Make sure we clear markers off correctly and hide NAV
                    //Also, do we want to clear all markers or just hide them until
                    //we return to browse mode?

                    map_clearAllMarkers();
                    map_AddMarker(latlng);

                    map_updateLinkedFields(latlng);

                }
            }
            //    			if (overlay)
            //    			{
            //    				//User has clicked on an existing marker.
            //    				//Whilst in 'add' mode
            //    				//Do nothing
            //    			}
        }

        // Processing for a 'Browse' Map
        if (iMapType == iBrowseMap) {
            if (latlng) {
                //User has clicked on the map
                //whilst in 'browse' mode
                //Zoom in

                if (mapZoom < maxZoom) {
                    if (mapZoom < (maxZoom - cintZoomInStep)) {
                        map.setCenter(latlng);
                        map.setZoom(mapZoom + cintZoomInStep);
                    }
                    else {
                        map.setCenter(latlng);
                        map.setZoom(maxZoom);
                    }
                }
            }
            // if (overlay) {
            //User has clicked on a marker
            //Do nothing.  Any Click events are attached to
            //the relevent marker when it's created.
            //See the map_addMarker function.
            // }
        }
    }
    else {
        if (map_checkCompatible()) {
            //Map is comptiable, something else has gone wrong.
            err_systemError("map_clickHandler", "Map not defined");
        }
    }
}


function map_updateLinkedFields(latlng) {

    //Update the fields for sending back to the server.
    var lat = latlng.lat();
    var lng = latlng.lng();

    //DEBUG
    //alert(lat + "," + lng);

    //Update Latitude Fields
    for (var i = 0; i < aLatitudeFields.length; i++) {
        document.getElementById(aLatitudeFields[i]).value = lat;
    }
    for (var i = 0; i < aLongitudeFields.length; i++) {
        document.getElementById(aLongitudeFields[i]).value = lng;
    }

}



// ---------------------------------------------------------------

//TODO - DO we need this function? Or do we need a show/hide function instead?
function map_clearAllMarkers() {

    //DEBUG:
    //alert("Clearing Markers");

    //Clear out our storage of the markers
    var vNodes = aMarkers[ciNodeIndex];
    var vMarkers = aMarkers[ciMarkerIndex];
    var vFilters = aMarkers[ciFilterIndex];

    vNodes.removeAllElements();
    vMarkers.removeAllElements();
    vFilters.removeAllElements();

    //Clear all markers off map    
    if (map) {
        //// map.clearOverlays();
        for (var i = 0; i < mapMarkers.length; i++) {
            mapMarkers[i].setMap(null);
        }
        mapMarkers = [];
    }
    else {
        if (map_checkCompatible()) {
            //Map is comptiable, something else has gone wrong.
            err_systemError("map_clearAllMarkers", "Map not defined");
        }
    }
}

function map_getBoundsString() {
    var strBoundsString = "";
    if (map) {
        var bounds = map.getBounds();
        if (typeof bounds != 'undefined') {
            var sw = bounds.getSouthWest();
            var ne = bounds.getNorthEast();
            strBoundsString += "&" + cstrMinLatField + "=" + sw.lat();
            strBoundsString += "&" + cstrMaxLatField + "=" + ne.lat();
            strBoundsString += "&" + cstrMinLongField + "=" + sw.lng();
            strBoundsString += "&" + cstrMaxLongField + "=" + ne.lng();
        }
        else {

            strBoundsString += "&" + cstrMinLatField + "=45.17856402753234";
            strBoundsString += "&" + cstrMaxLatField + "=62.892972703964915";
            strBoundsString += "&" + cstrMinLongField + "=-33.212890625";
            strBoundsString += "&" + cstrMaxLongField + "=23.212890625";
        }

    }
    else {
        if (map_checkCompatible()) {
            //Map is comptiable, something else has gone wrong.
            err_systemError("map_getBoundsString", "Map not defined");
        }
    }
    return strBoundsString;
}


function map_AddMarker(latlng, iNodeID, strName, iFilterID, iHandler, iAction, strIcon, bForceDisplay) {

    //We need to add this marker to the map.
    //It may already exist but we need to make a note of it for this particular filter.

    if (iMapType == iBrowseMap) {

        //DEBUG
        //inf_displayInfo("Adding marker: " + strName + ", filterID: " + iFilterID + ", Icon: " + strIcon);

        var vNodes = aMarkers[ciNodeIndex];
        var vMarkers = aMarkers[ciMarkerIndex];
        var vFilters = aMarkers[ciFilterIndex];
        var vFilterList;
        var vMarkerList;
        var index;

        //Check that this filter is still turned on
        if (!aFilters.contains(iFilterID) && !bForceDisplay) {
            //This filter has been turned off since we fetched the data.
            //Don't add the marker.
            //DEBUG
            //inf_displayInfo("Filter deactivated. Don't add marker");

            return;
        }

        if (vNodes.contains(iNodeID)) {
            //We already have this article marked
            //DEBUG:
            //alert("Have already got: " + iNodeID);

            //What position in our array is our Node?
            var index = vNodes.indexOf(iNodeID);

            //Extract our list of filters for this node.
            vFilterList = vFilters.getElementAt(index);

            //Make a note of the filter, if not got it already.
            if (!vFilterList.contains(iFilterID)) {
                //DEBUG
                //alert("Adding filter: " + iFilterID);

                vFilterList.addElement(iFilterID);

                //Extract our list of markers for this node.
                vMarkerList = vMarkers.getElementAt(index);

                //We need to change the marker displayed on the map
                //Get the marker that will be on the map i.e. the last one in the marker list
                var marker = vMarkerList.getLastElement();

                //Remove the marker from the map
                ////map.removeOverlay(marker);
                marker.setMap(null);

                //Create a new marker with the correct icon
                marker = map_createMarker(latlng, strIcon);

                //Add the marker to the marker List
                vMarkerList.addElement(marker);

                //Add the marker to the Map
                map_addMarkerToMap(marker, iNodeID, strName, iFilterID, iHandler, iAction);
            }

        }
        else {
            //We don't have this article.
            //DEBUG:
            //alert("Have not got: " + iNodeID);

            //Make a note of its ID
            vNodes.addElement(iNodeID);

            //Make a note of the filter it belongs to.
            vFilterList = new Vector(0);
            vFilters.addElement(vFilterList);
            vFilterList.addElement(iFilterID);

            //Create a marker for the point
            var marker = map_createMarker(latlng, strIcon);

            //Store the marker for future use
            vMarkerList = new Vector(0);
            vMarkers.addElement(vMarkerList);
            vMarkerList.addElement(marker);

            //Add the marker to the Map
            map_addMarkerToMap(marker, iNodeID, strName, iFilterID, iHandler, iAction);
        }
    }
    else {
        //This is an ADD map

        //Create a marker for the point
        // var marker = new GMarker(latlng, { draggable: true });
        var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            shadow: shadowIcon,
            icon: strIcon,
            draggable: true
        });

        mapMarkers.push(marker);
        //Add Handler for end of drag
        //GEvent.addListener(marker, "dragend", function () { map_updateLinkedFields(marker.getPoint()) });
        google.maps.event.addListener(marker, "dragend", function (event) {
            map_updateLinkedFields(marker.getPosition());
        });

        //Add the marker to the Map
        //map.addOverlay(marker);       
    }
}

function map_addMarkerToMap(marker, iNodeID, strName, iFilterID, iHandler, iAction) {

    //Add the Marker to the map
    //map.addOverlay(marker);
    mapMarkers.push(marker);
    //marker.setMap(map);

    // Define functionality for a 'Browse' Map
    if (iMapType == iBrowseMap) {

        switch (iHandler) {
            case cintHandlerClientScript:
                map_addClientScriptMarkerToMap(marker, iNodeID, strName, iFilterID, iAction);
                break;

            case cintHandlerServerPopUp:
                map_addServerPopUpMarkerToMap(marker, iNodeID, strName, iFilterID, iAction);
                break;
        }
    }
}

function map_addClientScriptMarkerToMap(marker, iNodeID, strName, iFilterID, iAction) {

    var strHTML = "";
    var iContext = cintContextMap;

    //Build up the HTML
    strHTML += "<span class='popupheader'>" + strName + "</span>";
    strHTML += "<br /><span class='popupbody'>"
    strHTML += "<a href='javascript:void(0)' onClick='nav_clickHandler(" + cintHandlerClientScript + "," + iAction + "," + iNodeID + "," + iFilterID + "," + iContext + ")'>Read more...</a></span>";

    var infowindow = new google.maps.InfoWindow({
        content: strHTML
    });

    //Add the event Listener for the marker
    google.maps.event.addListener(marker, "click", function () {
        infowindow.open(map, marker);
    });

}

function map_addServerPopUpMarkerToMap(marker, iNodeID, strName, iFilterID, iAction) {
    var iContext = cintContextMap;

    //Let the server deal with deciding what to do with the easy tide.
    google.maps.event.addListener(marker, "click", function () { nav_clickHandler(cintHandlerServerPopUp, iAction, iNodeID, iFilterID, iContext) });
    //GEvent.addListener(marker, "click", function() { window.open("serverPopUp.aspx?action=" + iAction + "&filter=" + iFilterID + "&nodeid=" + iNodeID)});

    //TODO - Can we make this function use a generic function to get the server action?
    //var strAction = "window.open('serverPopUp.aspx?action=" + iAction + "&filter=" + iFilterID + "&nodeid=" + iNodeID + ")";
    //var action = function() { eval(strAction) };
    //var actionFunction = nav_getServerPopUpFunction(iAction, iNodeID, iFilterID);
    //GEvent.addListener(marker, "click", actionFunction);

}

function map_createMarker(latlng, strIcon) {

    var marker;

    if (strIcon) {
        //We need to use the specified icon.
        var icon;

        //Have we already created it?
        if (aIconName.contains(strIcon)) {
            //Retreive the icon
            var i = aIconName.indexOf(strIcon);
            icon = aIconObject.getElementAt(i);
        }
        else {
            //Create the new icon

            imageIcon = new google.maps.MarkerImage(strIcon,
              new google.maps.Size(20, 34),
              new google.maps.Point(9, 34),
              new google.maps.Point(9, 2));

            icon = imageIcon;
            //icon.image = strIcon;

            //Store the icon for future use
            aIconName.addElement(strIcon);
            aIconObject.addElement(icon);
        }

        marker = new google.maps.Marker({
            position: latlng,
            map: map,
            shadow: shadowIcon,
            icon: strIcon
        });
        //marker = new GMarker(latlng,icon);
    }
    else {
        marker = new google.maps.Marker({
            position: latlng,
            map: map,
            shadow: shadowIcon
        });
    }

    return marker;
}


// ---------------------------
// SEARCH FUNCTIONALITY
// ---------------------------


function sea_clearTextIfMatches(strMatch) {
    var search = document.getElementById(cstrDivSearchID);

    if (search.value == strMatch) {
        search.value = "";
    }
}

function sea_keyPress(e) {
    var keynum;

    //Find out what key was pressed
    if (window.event) // IE
    {
        keynum = e.keyCode
    }
    else if (e.which) // Netscape/Firefox/Opera
    {
        keynum = e.which
    }

    //Do a search in 'Enter' is pressed
    if (keynum == 13) {
        sea_search();
    }

}

function sea_search() {

    //Extract Search Criteria
    var search = document.getElementById(cstrDivSearchID);
    var searchbutton = document.getElementById(cstrDivSearchButtonID);
    var strSearchText = search.value;
    var bDisplayList = true;

    //Disable search button
    searchbutton.disabled = true;
    //search.value = "Searching....";

    ajx_getSearch(strSearchText, 1, bDisplayList);


}

// ---------------------------
// AJAX FUNCTIONALITY
// ---------------------------

function ajx_getSearch(strSearch, intPageNumber, bDisplayList) {
    var strRequestQuery = cstrSearchDataRequestPage;
    //var request = GXmlHttp.create();
    var bOK = true;

    //Build up the Request Query String
    strRequestQuery += "&" + cstrSearchField + "=" + strSearch;
    strRequestQuery += "&pagesize=" + cintListPageSize;
    strRequestQuery += "&page=" + intPageNumber;

    //Inform the user as to what is going on.
    //inf_displayInfo("Searching for " + strSearch);

    //NOTE: we toggle the LIST indicator for the SEARCH
    inf_toggleIndicator(cintIndicatorList, true)

    $.ajax({
        url: strRequestQuery,
        dataType: "xml",
        async: true,
        success: function (data) {
            if (ajx_checkReturnedRequest(data, strRequestQuery)) {

                //Get the data out of the request.
                ajx_extractXMLData(data);
                //NOTE: Search is very much like the list request
                //and the returned XML is handled in the same way
                //as for a list

                //Update the Results List
                nav_updateList(bDisplayList, strSearch);

                //TODO - MOve to better place
                var search = document.getElementById(cstrDivSearchID);
                var searchbutton = document.getElementById(cstrDivSearchButtonID);
                //search.value = "Enter Search...";
            }
            else {
                strError = "Bad Request Object returned";
                bOK = false;
            }
        }
    });
    //	request.open("GET", strRequestQuery, true);
    //	request.onreadystatechange = function()
    //	{
    //		if (request.readyState == 4)
    //		{
    //			if (request.status == 200)
    //			{

    //				//Check that the returned request object is OK
    //				if (ajx_checkReturnedRequest(request,strRequestQuery))
    //				{

    //					//Get the data out of the request.
    //					ajx_extractXMLData(request);
    //				
    //					//NOTE: Search is very much like the list request
    //					//and the returned XML is handled in the same way
    //					//as for a list
    //				
    //					//Update the Results List
    //					nav_updateList(bDisplayList,strSearch);
    //					
    //					//TODO - MOve to better place
    //					var search = document.getElementById(cstrDivSearchID); 
    //					var searchbutton = document.getElementById(cstrDivSearchButtonID); 
    //					//search.value = "Enter Search...";


    //				}
    //				else
    //				{
    //					strError = "Bad Request Object returned";
    //					bOK = false;
    //				}
    //			}
    //			else
    //			{
    //				//Handle Request Failure
    //    			strError = "Request Status not valid";
    //    			bOK = false;
    //			}
    //		}
    //	}
    //	request.send(null);

    //Reactivate the search button
    searchbutton.disabled = false;

    if (!bOK) {
        err_systemError("ajx_getArticleSendRequest", "Data Request Failed: Call Made: " + strRequestQuery + ", Error Details: " + strError);
    }
}


//Get the displayHTML for an article and show it in the correct area
function ajx_getArticle(intNodeID, intPreferredFilterID, intOverlaySwitch) {

    //Get the HTML for this article.
    var strArticleInfo;
    var strRequestQuery = cstrArticleRequestPage;

    //NOTE: If this function is called whilst in Add mode, we need
    //reload the entire page in Browse mode.
    //TODO: this does not work
    if (iMapType == iAddMap) {
        var strRedirectPage = cstrMainPage + "?page=display&nodeid=" + intNodeID;
        window.location = strRedirectPage;
        return;
    }

    //Build up the Request Query String
    strRequestQuery += "&" + cstrNodeIDField + "=" + intNodeID;
    strRequestQuery += "&" + cstrPreferredFilterIDField + "=" + intPreferredFilterID;

    //Send the Request by AJAX	
    strArticleInfo = "#" + intNodeID;
    ajx_getArticleSendRequest(strArticleInfo, strRequestQuery, intPreferredFilterID, intOverlaySwitch);
}

function ajx_getArticleByName(strName, intPreferredFilterID, intOverlaySwitch) {
    //Get the HTML for this article.
    var strRequestQuery = cstrArticleRequestPage;

    //NOTE: If this function is called whilst in Add mode, we need
    //reload the entire page in Browse mode.
    //TODO: This does not work.
    if (iMapType == iAddMap) {
        var strRedirectPage = cstrMainPage + "?page=display&name=" + strName;
        window.location = strRedirectPage;
        return;
    }

    //Build up the Request Query String
    strRequestQuery += "&name=" + strName;

    //Send the Request by AJAX
    ajx_getArticleSendRequest(strName, strRequestQuery, intPreferredFilterID, intOverlaySwitch);
}

function ajx_getArticleSendRequest(strArticleInfo, strRequestQuery, intPreferredFilterID, iOverlaySwitch) {

    //	var request = GXmlHttp.create();
    var article = document.getElementById(cstrDivArticleID);
    var bOK = true;

    //Inform the user as to what is going on.
    inf_displayInfo("Retrieving article " + strArticleInfo);
    inf_toggleIndicator(cintIndicatorArticle, true)
    article.innerHTML = "Your article (" + strArticleInfo + ") is being fetched and will be displayed here shortly....";

    //Show the Article Pane if required
    //TODO: Put in logic to see if we actually want to display it.
    pne_showPane("article");

    //DEBUG
    //inf_displayInfo("Sending AJAX: " + strRequestQuery + ", OverlaySwitch: " + iOverlaySwitch);

    //Show browser compatability functionality.
    article.innerHTML += "<br /><br /><br /><br /><span class='small'>(Please note that this website only works in Internet Explorer, Netscape, Firefox and Opera.  Other browsers will be supported soon.)</span>";

    //Send the AJAX Request.
    $.ajax({
        url: strRequestQuery,
        dataType: "xml",
        async: true,
        success: function (data) {
            if (ajx_checkReturnedRequest(data, strRequestQuery)) {

                //Get the data out of the request.
                ajx_extractXMLData(data);

                //Display the Article
                art_displayArticle(intPreferredFilterID, iOverlaySwitch);

                //Update Advert
                goo_refreshAdUsingContent(strRequestQuery);
            }
            else {
                strError = "Bad Request Object returned";
                bOK = false;
            }
        }
    });
    //request.open("GET", strRequestQuery, true);
    //request.onreadystatechange = function()
    //{
    //if (request.readyState == 4)
    //{
    //if (request.status == 200)
    //{

    //Check that the returned request object is OK

    //}
    //else
    //{
    //Handle Request Failure
    //strError = "Request Status not valid";
    //bOK = false;
    //}
    //}
    //}
    //request.send(null);

    if (!bOK) {
        err_systemError("ajx_getArticleSendRequest", "Data Request Failed: Call Made: " + strRequestQuery + ", Error Details: " + strError);
    }

}

function ajx_checkReturnedRequest(request, strOriginalRequest) {

    //Check the returned request object for server
    //side errors or missing data

    var bOK = true;
    var strError = "";
    var nodeList = null;
    var xmlDoc = null;
    var strErrorTag = "error";

    //DEBUG
    //inf_displayInfo("Checking AJAX call: " + strOriginalRequest);

    //Extract the XML Document
    xmlDoc = request;

    //Check XML Document
    if (xmlDoc == null) {
        strError = "XML Document empty";
        bOK = false;
    }

    //Check DocumentElement is present
    if (bOK) {
        if (xmlDoc.documentElement == null) {
            strError = "XML Document Element is null";
            bOK = false;
        }
    }

    //Check NodeList/childNodes are present
    if (bOK) {
        //Get the list of dataFragment nodes that make up the article
        nodeList = xmlDoc.documentElement.childNodes;

        if (nodeList == null) {
            strError = "XML Node List is null";
            bOK = false;
        }
    }

    if (bOK) {
        //We have a node

        //Do we have error information?
        errorNode = xmlDoc.getElementsByTagName(strErrorTag);
        if (errorNode != null) {
            //Extract Error information
            if (errorNode.length > 0) {
                for (var i = 0; i < errorNode.length; i++) {
                    strError += errorNode.item(i).text;
                }
                bOK = false;
            }
        }
    }

    //Display any error information
    if (!bOK) {
        err_systemError("ajx_checkReturnedRequest", strError + " when calling " + strOriginalRequest);
    }

    return bOK;
}

//This function is called by the getArticle function once data returned by AJAX
function art_displayArticle(intPreferredFilterID, iOverlaySwitch) {

    var xmlDoc = null;
    var html = null;
    var errorNode = null;
    var nodeList = null;

    var strHtml = "";
    var bDisplayList = false;

    var strError = ""
    var bOK = true;

    var intNodeID = 0;
    var lng = 0;
    var lat = 0;

    //NOTE: We assume that the returned XML has been extracted into the XMLData vectors
    //and so we can get to the data now.

    //Check we have at least one item in XMLData
    if (gintXMLDataSize < 1) {
        strError = "Could not find any data in XMLData";
        bOK = false;
    }

    if (bOK) {
        intNodeID = aXMLData[ciXMLNodeIDIndex].getElementAt(0);
    }

    //Check we have some stored HTML to display
    if (bOK) {
        html = aXMLData[ciXMLHTMLIndex];

        if (html == null) {
            bOK = false;
            strError = "Could not find any stored HTML";
        }
        else {
            if (html.getSize() == 0) {
                bOK = false;
                strError = "Could not find any stored HTML";
            }
        }
    }

    if (bOK) {
        //Extract the Stored HTML
        for (var i = 0; i < html.getSize(); i++) {
            strHtml += html.getElementAt(i);

            //Demo code for adding in keyword adverts
            //          if (i==2 || i==4)
            //          {
            //              strHtml += goo_getIFrame("adcontent", 121, 468);
            //  		}
        }

        //Let the user know what's happening
        inf_displayInfo("article " + "#" + intNodeID + " retrieved");
        inf_toggleIndicator(cintIndicatorArticle, false);

        //Get a handle on the article DIV
        var article = document.getElementById(cstrDivArticleID);

        if (article != null) {
            //NOTE: This try/catch block is here to catch any invalid
            //HTML passed to article.innerHTML.
            //TODO: The try does not correctly catch the errors and
            //and a meaningless error message is displayed instead!
            try {

                var strAdvertHtml = goo_getIFrame("adcontent", 120, 1300);
                var articleAdvertContainerHtml = "<table cellpadding=0 cellspacing=0><tr>";
                articleAdvertContainerHtml += "<td class='article'>" + strHtml + "</td>";
                articleAdvertContainerHtml += "<td class='advert'>" + strAdvertHtml + "</td>";
                articleAdvertContainerHtml += "</tr></table>";
                article.innerHTML = articleAdvertContainerHtml;

                //PB 17.7.2008 Demo code for how to use keyword adverts. TODO add in correct keywords from returned XML				
                //				for (var i=0; i< html.getSize(); i++)
                //	            {
                //	                if (i==2)
                //	                {
                //	                    goo_refreshAdUsingKeywords(i,'mercedes benz');
                //	                }
                //	                if (i==4)
                //	                {
                //	                    goo_refreshAdUsingKeywords(i,'morroco');
                //	                }
                //	            }
            }
            catch (err) {
                strError = "Article HTML invalid: " + err.description;
                bOK = false;
            }
        }
        else {
            strError = "Could not get handle on article div";
            bOK = false;
        }
    }

    //Move Map to show new Article if required
    if (bOK) {
        if (iOverlaySwitch != null && iOverlaySwitch != ciOverlayDoNothing) {
            ajx_showArticleOnMap(intNodeID, intPreferredFilterID, iOverlaySwitch)
        }
    }

    //Show the Article Pane if required
    if (bOK) {
        //TODO: Put in logic to see if we actually want to display it.
        pne_showPane("article");
    }

    //Turn on the preferred filter in case it isn't already
    if (bOK) {
        if (intPreferredFilterID != 0) {
            //We don't want to display the results lists
            bDisplayList = false;
            fil_turnOnFilters(intPreferredFilterID, bDisplayList);
        }
    }

    //Display any error information
    if (!bOK) {
        err_systemError("art_displayArticle", strError);
    }
}




function ajx_showArticleOnMap(intNodeID, intPreferredFilterID, intOverlaySwitch) {

    //Build the Request String	
    var strRequestQuery = cstrMapDataRequestPage;
    strRequestQuery += "&" + cstrNodeIDField + "=";
    strRequestQuery += intNodeID

    if (intPreferredFilterID != 0) {
        strRequestQuery += "&" + cstrPreferredFilterIDField + "=";
        strRequestQuery += intPreferredFilterID;
    }

    //DEBUG
    //inf_displayInfo(strRequestQuery);

    //Send AJAX request
    ajx_showArticleOnMapSendRequest(strRequestQuery, intOverlaySwitch)

}

function ajx_showArticleOnMapSendRequest(strRequestQuery, iOverlaySwitch) {

    //Form and send the AJAX request.	
    //var request = GXmlHttp.create();
    var bOK = true;
    $.ajax({
        url: strRequestQuery,
        dataType: "xml",
        async: true,
        success: function (data) {
            if (ajx_checkReturnedRequest(data, strRequestQuery)) {

                //Get the data out of the request.
                ajx_extractXMLData(data);

                //Now Show the Article on the Map
                art_showArticleOnMap(iOverlaySwitch)
            }
            else {
                strError = "Bad Request Object returned";
                bOK = false;
            }
        }
    });
    //request.open("GET", strRequestQuery, true);
    //	request.onreadystatechange = function()
    //	{
    //		if (request.readyState == 4)
    //		{
    //			if (request.status == 200)
    //			{
    //		
    //				//Check that the returned request object is OK
    //				if (ajx_checkReturnedRequest(request,strRequestQuery))
    //				{
    //					//Get the data out of the request.
    //					ajx_extractXMLData(request);
    //			
    //					//Now Show the Article on the Map
    //					art_showArticleOnMap(iOverlaySwitch)
    //				}
    //				else
    //				{
    //					strError = "Bad Request Object returned";
    //					bOK = false;
    //				}
    //			}
    //			else
    //			{
    //				//Handle Request Failure
    //				strError = "Request Status not valid";
    //				bOK = false;
    //			}
    //		}
    //	}
    //	request.send(null);   

    if (!bOK) {
        err_systemError("ajx_showArticleOnMapSendRequest", "Data Request Failed: Call Made: " + strRequestQuery + ", Error Details: " + strError);
    }

}


function art_showArticleOnMap(iOverlaySwitch) {
    var bOK = true;

    var bForceDisplay = true; 	//Show the marker even if filter turned off

    var lng = aXMLData[ciXMLLngIndex].getElementAt(0);
    var lat = aXMLData[ciXMLLatIndex].getElementAt(0);

    //Only add this marker if it has good lat/lng
    if (!lat || !lng) {
        bOK = false;
    }

    if (lat == 0 && lng == 0) {
        bOK = false;
    }

    if (bOK) {
        //Obtain the coordinates of the article and center on it
        map_handleOverlaySwitch(lat, lng, iOverlaySwitch)

        //Plot the article's marker on the map
        //TODO Put in force flag to override turned off filters.
        map_addOverlays(bForceDisplay)

        //Let the User know what is happening
        inf_displayInfo("Map Updated.");

    }
}

function map_handleOverlaySwitch(lat, lng, iOverlaySwitch) {

    var bOK = true;

    //Check lat and lng are valid
    if (!lat || !lng) {
        bOK = false;
        strError = "Lat/Lng are undefined";
    }

    if (bOK) {
        var latlng = new google.maps.LatLng(lat, lng);

        //DEBUG
        //inf_displayInfo("Handling Overlay Switch at: " + lat + "," + lng);

        //Possible values are:
        //ciOverlayDoNothing	= 0;
        //ciOverlayCentre		= 1;
        //ciOverlayZoom			= 2;
        //ciOverlayPartialZoom  = 4;
        //ciOverlayShowInfo		= 8;	

        if ((iOverlaySwitch & ciOverlayCentre) ||
			(iOverlaySwitch & ciOverlayZoom) ||
			(iOverlaySwitch & ciOverlayPartialZoom)) {

            if (iOverlaySwitch & ciOverlayZoom) {
                //Toggle Zoom.
                if (map.getZoom() == cintMinimumZoomToAddMarker) {
                    map.setCenter(latlng);
                    map.setZoom(intInitialZoom);
                }
                else {
                    map.setCenter(latlng);
                    map.setZoom(cintMinimumZoomToAddMarker);
                }
            }
            else if (iOverlaySwitch & ciOverlayPartialZoom) {
                map.setCenter(latlng);
                map.setZoom(cintPartialZoomLevel);
            }
            else {
                //DEBUG
                //inf_displayInfo("Centre Map " + iOverlaySwitch);
                map.setCenter(latlng);
            }

        }

        //TODO
        //Show Popup window
    }

    if (!bOK) {
        err_systemError("map_handleOverlaySwitch", "Cannot Update Map: " + strError);
    }

}


function map_addLinkedField(strField, strID) {
    //This function builds an array of document
    //element IDs that need to have their values
    //updated by the Google Map.

    //Event listeners for the map will update these
    //fields with information from the map.

    //These fields can then be sent back to the server
    //in a submitted form.

    //Add a field
    switch (strField) {
        case "longitude":
            aLongitudeFields.push(strID);
            break;

        case "latitude":
            aLatitudeFields.push(strID);
            break;
    };

}




//Plot a marker for any linked location fields
function map_plotLinkedFields(bZoomIn) {
    if (map) {
        if (iMapType == iAddMap) {
            map_clearAllMarkers();
        }

        for (var i = 0; i < aLatitudeFields.length; i++) {

            var lat = document.getElementById(aLatitudeFields[i]).value;
            var lng = document.getElementById(aLongitudeFields[i]).value

            //Only plot a point if we've any data in our linked fields.
            //These fields are likely to be empty if we are adding a new location
            //TODO - Check for zero coordingaes so that 'add' doesnt' put a point in mid atlantic.

            if (lat != 0 || lng != 0) {

                var latlng = new google.maps.LatLng(lat, lng);
                //var mapType = map.getCurrentMapType();
                //var maxZoom = mapType.getMaximumResolution(latlng);
                var maxZoomService = new google.maps.MaxZoomService();
                var maxZoom = 16;
                maxZoomService.getMaxZoomAtLatLng(latlng, function (response) {
                    if (response.status == google.maps.MaxZoomStatus.OK) {
                        maxZoom = response.zoom;
                    }
                });
                //Zoom in if requested
                if (bZoomIn) {
                    map.setCenter(latlng);
                    map.setZoom(maxZoom);
                }

                //Add the marker
                map_AddMarker(latlng);
            }
        }
    }
    else {
        if (map_checkCompatible()) {
            //Map is comptiable, something else has gone wrong.
            err_systemError("map_plotLinkedFields", "Map not defined");
        }
    }

}

// ----------------------------
// DISPLAY PANES
// ----------------------------


function pne_initialise() {
    //Configure Panes

    var aPaneDiv = null;

    for (var i = 0; i < cintNumberPanes; i++) {

        //Define Pane contents
        aPaneDivs[i] = new Vector(0);
        aPaneDiv = aPaneDivs[i];

        switch (aPane[i]) {
            case "article":
                aPaneDiv.addElement(cstrDivMapID);
                aPaneDiv.addElement(cstrDivArticleID);
                break;

            case "results":
                aPaneDiv.addElement(cstrDivMapID);
                aPaneDiv.addElement("divSearch");
                aPaneDiv.addElement("divResults");
                break;

            case "prefs":
                aPaneDiv.addElement(cstrDivMapID);
                aPaneDiv.addElement("divFilter");
                break;

            default:
                err_systemError("pne_initialise", "Invalid pane name: " + aPane[i]);
                break;

        }
    }
}

function tbr_initialise() {

    for (var i = 0; i < cintNumberDivs; i++) {

        //Prepare for toolbars
        aDivToolbars[i] = new Array(3);

        //TODO: replace integers with contstants
        aDivToolbars[i][0] = new Vector(0); 			//Name
        aDivToolbars[i][1] = new Vector(0); 			//Tooltip
        aDivToolbars[i][2] = new Vector(0); 			//Label
    }

    //Add in some default items	
    tbr_buildDivToolbar(cstrDivMapID, "new", "Add a new location", "Add Place");
    //tbr_buildDivToolbar(cstrDivMapID,"resetmap","Reset Map to original location","Reset Map");

}

function pne_addTabs() {

    //Loop through our panes and
    //display tabs for them.

    if (iMapType == iBrowseMap) {
        var tabs = document.getElementById(cstrDivTabsID);
        var html = "";

        if (tabs == null) {
            err_systemError("pne_addTabs", "Could not get handle on tabs div: " + cstrDivTabsID);
        }

        html += '<table bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0">';
        html += "<tr><td>";

        for (var i = 0; i < cintNumberPanes; i++) {
            html += pne_getTabButton(aPane[i]);
        }

        html += "</td>";
        html += "</tr></table>";

        tabs.innerHTML = html;
    }
    else {
        //This is an add map so we won't need most of our DIVS.  However, don't touch the
        //Map div because its display state will have been dealth with by the serverload code
        //and will be dependent on whether we have an article with a location or not.
        for (var i = 0; i < aDivs.length; i++) {
            if (aDivs[i] != cstrDivMapID) {
                pne_hideDiv(aDivs[i]);
            }
        }
    }
}

function pne_getTabButton(strPaneName) {
    var html = "";

    html += "<a href='javascript:void(0)'";
    html += " onMouseOut=\"MM_nbGroup('out');\"";
    html += " onMouseOver=\"MM_nbGroup('over','" + strPaneName + "','images/tab_" + strPaneName + "_over.gif','images/tab_" + strPaneName + "_down.gif',1);\"";
    html += " onClick=\"MM_nbGroup('down','tabBar','" + strPaneName + "','images/tab_" + strPaneName + "_down.gif',1);pne_showPane('" + strPaneName + "');\">";
    html += "<img name='" + strPaneName + "' src='images/tab_" + strPaneName + ".gif' width='67' height='24' border='0' alt=''>";
    html += "</a>";


    return html;
}


function pne_showPane(strPaneName) {

    var intPaneID = -1;

    intPaneID = pne_getID(strPaneName);

    //DEBUG
    //inf_displayInfo("Displaying Pane:  " + strPaneName);

    //Show the Pane using the ID number.
    pne_showPaneByID(intPaneID)

}



//Show a different pane
function pne_showPaneByID(intPaneID) {

    var pane;
    var strPaneName;
    var aPaneDiv;
    var bNewPane = false;


    //DEBUG
    //inf_displayInfo("Changing to Pane " + intPaneID);

    //Check ID parameter
    if (intPaneID < 0 || intPaneID >= cintNumberPanes) {
        err_systemError("pne_showPaneByID", "Invalid Pane Number: " + intPaneID);
        return;
    }

    //Establish Name
    strPaneName = aPane[intPaneID];

    //DEBUG
    //inf_displayInfo("This Pane is called " + strPaneName);

    //We are changing to a new pane
    if (intPaneID != gintCurrentPane) {
        bNewPane = true;
    }

    //DEBUG
    //inf_displayInfo("New Pane status: " + bNewPane);

    if (bNewPane) {

        //Firstly hide the current Pane
        //if we have a real one selected
        if (gintCurrentPane >= 0) {
            pne_hidePaneByID(gintCurrentPane);
        }
        else {
            pne_hideAll();
        }

        //Go through all the DIVS for this pane
        //and show them
        aPaneDiv = aPaneDivs[intPaneID];

        for (var i = 0; i < aPaneDiv.getSize(); i++) {
            strDivName = aPaneDiv.getElementAt(i);
            pne_showDiv(strDivName);
        }
    }

    //Make a note of our Current Pane
    gintCurrentPane = intPaneID;

    //Make sure TAB is activated
    MM_nbGroup('down', 'tabBar', strPaneName, 'images/tab_' + strPaneName + '_down.gif', 1);

    //Update Toolbar
    if (bNewPane) {
        //Now update the toolbar for this pane
        tbr_updateToolbar();
    }

}

function pne_hideAll() {
    var div;

    for (var i = 0; i < aDivs.length; i++) {
        pne_hideDiv(aDivs[i])
    }
}


function pne_hidePaneByID(intPaneID) {
    var aPaneDiv = null;
    var strDivName = "";
    var div = null;

    //Check parameter
    if (intPaneID < 0 || intPaneID >= cintNumberPanes) {
        err_systemError("pne_hidePaneByID", "Invalid Pane Number: " + intPaneID);
        return;
    }

    //Go through all the DIVS for this pane
    //and show them
    aPaneDiv = aPaneDivs[intPaneID];

    for (var i = 0; i < aPaneDiv.getSize(); i++) {
        strDivName = aPaneDiv.getElementAt(i);
        pne_hideDiv(strDivName);
    }

    //Reset our Current Pane
    gintCurrentPane = -1;
}

function pne_hideDiv(strDivName) {
    var div = document.getElementById(strDivName);
    if (div) {
        div.style.display = "none";
    }
    else {
        err_systemError("Could not locate div called: " + strDivName);
    }
}

function pne_showDiv(strDivName) {
    var div = document.getElementById(strDivName);
    if (div) {
        div.style.display = "block";
    }
    else {
        err_systemError("Could not locate div called: " + strDivName);
    }
}




function pne_getID(strPaneName) {

    var intPaneID = -1;

    //Check Parameter
    if (strPaneName == "") {
        err_systemError("pne_getID", "Invalid Pane Name");
        return;
    }

    //Identify the pane number for the pane.
    for (var i = 0; i < cintNumberPanes; i++) {
        if (aPane[i] == strPaneName) {
            intPaneID = i;
        }
    }

    //Did we find anything?
    if (intPaneID < 0 || intPaneID >= cintNumberPanes) {
        err_systemError("pne_getID", "Invalid Pane Name: " + strPaneName);
    }

    return intPaneID;
}

function div_getID(strDivName) {
    var intDivID = -1;

    //Check Parameter
    if (strDivName == "") {
        err_systemError("div_getID", "Invalid Div Name");
        return;
    }

    //Identify the pane number for the pane.
    for (var i = 0; i < cintNumberDivs; i++) {
        if (aDivs[i] == strDivName) {
            intDivID = i;
        }
    }

    //Did we find anything?
    if (intDivID < 0 || intDivID >= cintNumberDivs) {
        err_systemError("div_getID", "Invalid Div Name: " + strDivName);
    }

    return intDivID;
}


//------------------------
//NAVIGATION FUNCTIONALITY
//------------------------


/*
function nav_hideNav()
{
document.getElementById(cstrDivNavID).style.visibility="hidden";
}

function nav_showNav()
{
document.getElementById(cstrDivNavID).style.visibility="visible";
}
*/

function nav_showControls() {
    //document.getElementById(cstrDivControlsID).style.visibility="visible";
}









//This function called when map coordinates are changed
//Build up a list of filters to pass to the getMapData function
function map_updateMap() {
    var strFilters;

    //DEBUG
    //alert("updatemap");

    strFilters = fil_getFiltersString();

    //Fetch and plot map data
    ajx_getMapData(strFilters);

    //Update Cookie (on Browse map only)
    if (iMapType == iBrowseMap) {

        var centre = map.getCenter();
        var cMapZoom = map.getZoom();

        SetCookie(cstrCentreLatField, centre.lat(), cookieExpiryDate);
        SetCookie(cstrCentreLngField, centre.lng(), cookieExpiryDate);
        SetCookie(cstrZoomField, cMapZoom, cookieExpiryDate);

        //DEBUG
        //inf_displayInfo("Map settings: " + bounds.minX + "," + bounds.maxX + "," + bounds.minY + "," + bounds.maxY + "," + centre.x + "," + centre.y + "," + map.getZoomLevel());
        //inf_displayInfo("Setting Cookie to: " + bounds.maxY);
        //inf_displayInfo("Cookie now  holds: " + GetCookie(cstrMaxLatField));

    }
    else {
        //Draw any linked fields we may have.
        map_plotLinkedFields();
    }
}





//Function to do AJAX call and then call the redrawMap function
//This function called by
// -  fil_processFilters
// -  map_updateMap
function ajx_getMapData(strFilters) {

    var bOK = true;
    var bForceDisplay = false; 	//Don't show marker if filter turned off

    //Don't update the navigation if we are adding a marker.
    if (iMapType == iAddMap) {
        return;
    }

    //Clear the map if we have no filters
    if (strFilters == "") {
        map_clearAllMarkers();
        return;
    }

    //Clear any old info overlays
    inf_hideInfoWindow();


    //Build the Request String	
    var strRequestQuery = cstrMapDataRequestPage;
    strRequestQuery += map_getBoundsString();
    strRequestQuery += "&" + cstrFilterField + "=";
    strRequestQuery += strFilters;


    //DEBUG: Display request sting
    //inf_displayInfo("Get Map Data with: " + strRequestQuery);

    //Let the User know we are retrieving some data to update the Map.
    //inf_displayInfo("Updating Map...")
    inf_toggleIndicator(cintIndicatorMap, true);

    //Form and send the AJAX request.	
    //var request = GXmlHttp.create();

    //request.open("GET", strRequestQuery, true);
    $.ajax({
        url: strRequestQuery,
        dataType: "xml",
        async: true,
        success: function (data) {
            if (ajx_checkReturnedRequest(data, strRequestQuery)) {
                //Get the data out of the request.
                ajx_extractXMLData(data);

                //Update the Map
                map_addOverlays(bForceDisplay);
            }
            else {
                strError = "Bad Request Object returned";
                bOK = false;
            }
        }
    });
    //request.onreadystatechange = function()
    //{
    //if (request.readyState == 4)
    //{
    //if (request.status == 200)
    //{

    //Check that the returned request object is OK

    //}
    //else
    //{
    //Handle Request Failure
    //  strError = "Request Status not valid";
    // bOK = false;
    //}
    //}
    //}
    //request.send(null);   

    if (!bOK) {
        err_systemError("ajx_getMapData", "Data Request Failed: Call Made: " + strRequestQuery + ", Error Details: " + strError);
    }
}


//This function called when mapData has been fetched from the DB using an AJAX call
//This happens when a filter is turned on or the map coordinates have changed
function map_addOverlays(bForceDisplay) {

    var bOK = true;

    //NOTE:
    //We assume that the aXMLData arrays have been
    //populated before this function is called.

    //TODO - Do we need to remove old markers on the map?
    //Why not just leave them there and save on processing time.
    //This may become an issue if the map gets filled up with lots of
    //icons

    //Add the markers to the map.	
    for (var i = 0; i < gintXMLDataSize; i++) {
        var nodeid = aXMLData[ciXMLNodeIDIndex].getElementAt(i);
        var name = aXMLData[ciXMLNameIndex].getElementAt(i);
        var lng = aXMLData[ciXMLLngIndex].getElementAt(i);
        var lat = aXMLData[ciXMLLatIndex].getElementAt(i);
        var filterid = aXMLData[ciXMLFilterIDIndex].getElementAt(i);
        var filtername = aXMLData[ciXMLFilterNameIndex].getElementAt(i);
        var icon = aXMLData[ciXMLIconIndex].getElementAt(i);
        var handler = parseInt(aXMLData[ciXMLHandlerIndex].getElementAt(i));
        var action = parseInt(aXMLData[ciXMLActionIndex].getElementAt(i));

        var latlng = new google.maps.LatLng(lat, lng);

        map_AddMarker(latlng, nodeid, name, filterid, handler, action, icon, bForceDisplay);

    }

    if (!bOK) {
        err_systemError("map_addOverlays", "Could not add overlays to map: " + strError);
    }

    //Let user know what is happening
    if (gintXMLDataSize > 0) {
        inf_displayInfo("Map updated.");
    }
    inf_toggleIndicator(cintIndicatorMap, false);

}

function ajx_extractXMLData(validRequest) {
    //Extract data returned in XML object by AJAX call

    //This function has to be clever enough to pull out the relevent
    //data from the returned XML.

    //We need to inspect the top node name and make a decision on
    //behaviour based on it.

    //NOTE:
    //We assume that the request object has been
    //validated before this function is called so
    //that extracting XML information does not fail.

    var xmlDoc = validRequest;
    var strRootTag = xmlDoc.documentElement.nodeName;
    var bOK = true;


    //Prepare data stores for the XML Data
    ajx_clearXMLData();

    //Extract the data depending on what it is.
    switch (strRootTag) {

        case cstrArticleRootNode:
            ajx_extractArticleXMLData(xmlDoc);
            break;

        case cstrListRootNode:
            ajx_extractListXMLData(xmlDoc);
            break;

        case cstrInfoRootNode:
            ajx_displayInfo(xmlDoc);
            break;

        default:
            bOK = false;
            strError = "Returned XML root tag: " + strRootTag + " was not recognised.";
            break;

    }

    //Establish how many nodes were pulled out.
    gintXMLDataSize = aXMLData[ciXMLNodeIDIndex].getSize();

    if (!bOK) {
        err_systemError("ajx_extractXMLData", "Could not extract XML Data: " + strError);
    }


    //DEBUG
    //inf_displayInfo("Found " + gintXMLDataSize + " records in XML");

}

//Clear out any AJAX returned Data
function ajx_clearXMLData() {
    //NOTE: This replaces any previous arrays stored during earlier AJAX calls
    for (var i = 0; i < aXMLData.length; i++) {
        aXMLData[i] = new Vector(0);
    }

    //Reset any global variables
    gintXMLDataSize = 0;
    gintResultsNumberArticles = 0;
    gintResultsNumberPages = 0;
    gintResultsPageNumber = 0;
}

function ajx_displayInfo(xmlDoc) {

    var type = xmlDoc.getElementsByTagName("type");
    var label = xmlDoc.getElementsByTagName("label");

    var strInfo = "";
    var strType = "";


    //Extract the label
    if (label.length > 0) {
        strInfo = label[0].firstChild.nodeValue;
    }
    else {
        strInfo = "Error in information label";
    }

    //Extract the type
    if (type.length > 0) {
        strType = type[0].firstChild.nodeValue;
    }
    else {
        strType = "unknown";
    }

    switch (strType) {
        //Display the label in an info window              
        case "popup":
            inf_displayInfoWindow(strInfo)
            break;

        //Display the label in the Info Line              
        case "line":
            inf_displayInfo(strInfo);
            break;

        //Default to showing in info line              
        default:
            inf_displayInfo(strInfo);
            break;

    }

}

function ajx_extractListXMLData(xmlDoc) {
    //Extract Page Summary
    //Store this so that navigation can be built
    //TODO - Make this more generic and remove string literals!
    var element = xmlDoc.getElementsByTagName(cstrPageNumberTag);
    if (element.length > 0) {
        gintResultsPageNumber = parseInt(element[0].firstChild.nodeValue);
    }

    element = xmlDoc.getElementsByTagName(cstrNumberPagesTag);
    if (element.length > 0) {
        gintResultsNumberPages = parseInt(element[0].firstChild.nodeValue);
    }

    element = xmlDoc.getElementsByTagName(cstrNumberArticlesTag);
    if (element.length > 0) {
        gintResultsNumberArticles = parseInt(element[0].firstChild.nodeValue);
    }

    //Now get generic Information   	
    ajx_extractGenericXMLData(xmlDoc);

    //Update Info Line
    //inf_displayInfo("Found " + gintResultsNumberArticles + " articles");
}

function ajx_extractSingleTag(xmlDoc, strTagName) {
    var strValue;
    var strError;
    var bOK = true;
    var element = xmlDoc.getElementsByTagName(strTagName);

    if (element.length > 0) {
        strValue = element[0].firstChild.nodeValue;
    }
    else {
        bOK = false;
        strError = "Could not find '" + strTagName + "' in XML";
    }

    if (!bOK) {
        err_systemError("ajx_extractSingleTag", strError);
    }

    return strValue;
}

function ajx_extractArticleXMLData(xmlDoc) {
    //Article data consists for two things
    //1. General article Data
    //2. Individual datafragment information stored in separate <item> tags

    //To build the toolbar we need to extract the following general article data
    //1. NodeID
    //2. Preferred Filter ID

    var strError = "";
    var bOK = true;
    var nodeid = xmlDoc.getElementsByTagName("nodeid");
    var preferredfilterid = xmlDoc.getElementsByTagName("preferredfilterid");
    var link = xmlDoc.getElementsByTagName("link");
    var emaillink = xmlDoc.getElementsByTagName("emaillink");
    var name = xmlDoc.getElementsByTagName("name");


    //Extract general information about the article	
    intXMLNodeID = ajx_extractSingleTag(xmlDoc, "nodeid");
    intXMLPreferredFilterID = ajx_extractSingleTag(xmlDoc, "preferredfilterid"); ;
    strXMLLink = ajx_extractSingleTag(xmlDoc, "link");
    strXMLKeywords = ajx_extractSingleTag(xmlDoc, "keywords");
    //TODO - Use of email sending client side is messy. Change to server side.
    strXMLEmailLink = ajx_extractSingleTag(xmlDoc, "emaillink");
    strXMLName = ajx_extractSingleTag(xmlDoc, "name");


    //Now fetch any client side actions for this article
    ajx_extractArticleActionXMLData(xmlDoc);

    //Now get the generic XML Data
    ajx_extractGenericXMLData(xmlDoc);

}


function ajx_extractArticleActionXMLData(xmlDoc) {

    //Extract any actions for this article
    //and add them to the toolbar.

    var xmlArticleActions = xmlDoc.getElementsByTagName("action");
    var name = "";
    var label = "";
    var tooltip = "";
    var strName = "";
    var strLabel = "";
    var strToolTip = "";
    var intDivID = -1;


    intDivID = div_getID(cstrDivArticleID);

    //Clear old Toolbar for this DIV
    tbr_clearDivToolbarByID(intDivID)

    for (var i = 0; i < xmlArticleActions.length; i++) {
        //Extract relevent element from XML		
        name = xmlArticleActions[i].getElementsByTagName("name");
        tooltip = xmlArticleActions[i].getElementsByTagName("tooltip");
        label = xmlArticleActions[i].getElementsByTagName("label");

        //Extract info we need
        strName = name[0].firstChild.nodeValue;
        strToolTip = tooltip[0].firstChild.nodeValue;
        strLabel = label[0].firstChild.nodeValue;


        //Store the toolbar information.
        tbr_buildToolbarByID(intDivID, strName, strToolTip, strLabel)
    }

    //Update the Toolbar
    tbr_updateToolbar();
}



function ajx_extractGenericXMLData(xmlDoc) {

    //This function extracts the contents of returned AJAX XML
    //and stuffs it into an array of vectors.
    //We have one vector per XML Tag.  If there is missing data
    //the we store null.

    var nodelist = xmlDoc.getElementsByTagName("item");
    var value = "";
    var vXMLData = null;
    var element = null;

    //Loop through every item
    for (var i = 0; i < nodelist.length; i++) {
        //Loop through every expected field in each item
        for (var j = 0; j < aXMLData.length; j++) {

            //Get a handle on the vector for this field
            vXMLData = aXMLData[j];

            //Get hold of the field we're interested in
            element = nodelist[i].getElementsByTagName(aXMLFieldTags[j]);

            //Reset Value
            value = "";

            //Check to see if we have something
            if (element.length > 0) {
                if (element[0].firstChild != null) {
                    value = element[0].firstChild.nodeValue;
                }
            }

            //Store this data
            vXMLData.addElement(value);
        }
    }
}


function nav_getList(strFilters, intPageNumber, bDisplayList) {
    //Get an updated results list
    var bOK = true;

    //Don't update the navigation if we are adding/editing an article
    if (iMapType == iAddMap) {
        return;
    }

    //Have we got any filters to fetch?
    if (strFilters == "") {
        //Clear the list
        ajx_clearXMLData();

        //Update the Results List
        nav_updateList(bDisplayList, "");

        return;
    }


    //Build the Request String
    var strRequestQuery = cstrListDataRequestPage;
    strRequestQuery += "&filters=" + strFilters;
    strRequestQuery += "&pagesize=" + cintListPageSize;
    strRequestQuery += "&page=" + intPageNumber;

    //DEBUG: Display request sting
    //inf_displayInfo(strRequestQuery);

    //Turn on list Indicator
    inf_toggleIndicator(cintIndicatorList, true);

    $.ajax({
        url: strRequestQuery,
        dataType: "xml",
        async: true,
        success: function (data) {
              //Check that the returned request object is OK
                if (ajx_checkReturnedRequest(data, strRequestQuery)) {

                    //Get the data out of the request.
                    ajx_extractXMLData(data);

                    //Update the Results List
                    nav_updateList(bDisplayList, "");
                }
                else {
                    strError = "Bad Request Object returned";
                    bOK = false;
                }
        }
    });
    //Form and send the AJAX request.	
    //var request = GXmlHttp.create();

    //request.open("GET", strRequestQuery, true);
    //request.onreadystatechange = function () {
    //    if (request.readyState == 4) {
    //       if (request.status == 200) {

    //            //Check that the returned request object is OK
    //            if (ajx_checkReturnedRequest(request, strRequestQuery)) {

    //                //Get the data out of the request.
    //                ajx_extractXMLData(request);
//
    //                //Update the Results List
    //                nav_updateList(bDisplayList, "");
    //            }
    //            else {
    //                strError = "Bad Request Object returned";
    //                bOK = false;
    //            }
    //        }
    //        else {
    //            //Handle Request Failure
    //            strError = "Request Status not valid";
    //            bOK = false;
    //        }
    //    }
    //}
    //request.send(null);

    if (!bOK) {
        err_systemError("nav_getList", "Data Request Failed: Call Made: " + strRequestQuery + ", Error Details: " + strError);
    }
}

function nav_updateList(bDisplayList, strSearchString) {

    //This function
    //1) Process the XML sent back from the Server
    //2) Adds an entry to the results pane for each item

    var bOK = true;
    var results = document.getElementById("divResults");
    var strHTML = "";
    var intShadeNumber = 0;
    var iContext = cintContextResultsPane;
    var iOverlaySwitch = ciOverlayCentre;
    var strFilters = "";
    var iListType = cintFilterList;

    strHTML = "<table class='resultstable'>";


    //Do we have a search string?
    if (strSearchString) {
        iListType = cintSearchList;
    }

    //Firstly put in list controls
    strHTML += nav_getListSummary(strSearchString);
    strHTML += nav_getListControls(iListType, bDisplayList, strSearchString);

    //Alert user if there is no data
    if (gintXMLDataSize == 0) {
        strHTML += "<tr><td class='resultsinfo'>";
        strHTML += "No articles have been found for the specified filters and/or search options. ";
        strHTML += "Please select different filters or change your search options.";
        strHTML += "</td></tr>";
    }

    //Now build up the List
    if (bOK) {
        for (var i = 0; i < gintXMLDataSize; i++) {
            var nodeid = aXMLData[ciXMLNodeIDIndex].getElementAt(i);
            var name = aXMLData[ciXMLNameIndex].getElementAt(i);
            var filterid = aXMLData[ciXMLFilterIDIndex].getElementAt(i);
            var filtername = aXMLData[ciXMLFilterNameIndex].getElementAt(i);
            var handler = parseInt(aXMLData[ciXMLHandlerIndex].getElementAt(i));
            var action = parseInt(aXMLData[ciXMLActionIndex].getElementAt(i));
            var html = aXMLData[ciXMLHTMLIndex].getElementAt(i);
            var lat = parseFloat(aXMLData[ciXMLLatIndex].getElementAt(i));
            var lng = parseFloat(aXMLData[ciXMLLngIndex].getElementAt(i));

            //Set the Style Sheet Number
            intShadeNumber = i % 2;

            //Add the HTML to the strHTML
            //NOTE: We rely on the server to provide the layout and formatting of
            //each individual row, but the overall formatting is controlled here
            strHTML += "<tr class='resultsline" + intShadeNumber + "'><td>";
            strHTML += html;
            strHTML += "</td>";
            strHTML += "<td class='resultslink'>";
            strHTML += "<a href='javascript:void(0)' onClick='nav_clickHandler(" + handler + "," + action + "," + nodeid + "," + filterid + "," + iContext + ")'>";
            strHTML += "more...</a>"

            //Only add in the Show on Map link if it has a location.
            if (!((isNaN(lat) || isNaN(lng)) || (lat == 0 && lng == 0))) {
                strHTML += "<br />";
                strHTML += "<a href='javascript:void(0)' onClick='ajx_showArticleOnMap(" + nodeid + "," + filterid + "," + iOverlaySwitch + ")'>";
                strHTML += "Show on map...</a>";
            }

            strHTML += "</td></tr>";
        }
    }


    //Duplicate the controls
    strHTML += nav_getListControls(iListType, bDisplayList, strSearchString);

    strHTML += "</table>";

    //Set the HTML for the results pane
    results.innerHTML = strHTML;


    //Now show the results pane if necessary
    //TODO - Put in logic to see if this is necessary
    if (bDisplayList) {
        pne_showPane("results");
    }

    //Let user know what's happening
    //inf_displayInfo("List updated.");
    inf_toggleIndicator(cintIndicatorList, false);

    if (!bOK) {
        err_systemError("ind_updateIndex", "Could not add items to Index: " + strError);
    }

}

function nav_getListSummary(strSearchString) {

    var strHTML = "";

    strHTML = "<tr class='resultscontrols'><td colspan='2'>"

    if (gintResultsNumberArticles > 1) {
        strHTML += "Found " + gintResultsNumberArticles + " articles";
    }

    //Add in search details
    if (strSearchString) {
        strHTML += " when searching for '" + strSearchString + "'.";
    }
    else {
        strHTML += ".";
    }


    if (gintResultsNumberPages > 1) {
        //strHTML += "Found " + gintResultsNumberPages + " pages of results. ";
        strHTML += " Page " + gintResultsPageNumber + "/" + gintResultsNumberPages + ".";
    }

    strHTML += "</td></tr>";

    return strHTML;

}

function nav_getListControls(iListType, bDisplayList, strSearchText) {

    //Controls are differ depending on 

    //TODO: SHould these controls be defined elsewhere?

    var strHTML = "";
    var strFilters = fil_getFiltersString();
    var strPreviousAction = "";
    var strNextAction = "";

    //Establish adjacent page numbers
    var intPreviousPage = parseInt(gintResultsPageNumber) - 1;
    var intNextPage = parseInt(gintResultsPageNumber) + 1;

    strHTML = "<tr class='resultscontrols'><td colspan='2'>"

    switch (iListType) {
        case (cintFilterList):
            strPreviousAction = "nav_getList(\"" + strFilters + "\"," + intPreviousPage + "," + bDisplayList + ")";
            strNextAction = "nav_getList(\"" + strFilters + "\"," + intNextPage + "," + bDisplayList + ")";
            break;

        case (cintSearchList):
            strPreviousAction = "ajx_getSearch(\"" + strSearchText + "\"," + intPreviousPage + "," + bDisplayList + ")";
            strNextAction = "ajx_getSearch(\"" + strSearchText + "\"," + intNextPage + "," + bDisplayList + ")";
            break;

    }


    //Put in previous Link
    if (gintResultsPageNumber > 1) {

        strHTML += "<a href='javascript:void(0)' onClick='" + strPreviousAction + "'>";
        strHTML += "< Previous Page.";
        strHTML += "</a> ";
    }

    //Put in Next Link
    if (gintResultsPageNumber < gintResultsNumberPages) {

        strHTML += "<a href='javascript:void(0)' onClick='" + strNextAction + "'>";
        strHTML += "Next Page >";
        strHTML += "</a>";
    }
    strHTML += "</td></tr>";

    return strHTML;

}




function nav_clickHandler(iHandler, iAction, iNodeID, iFilterID, iContext) {

    //DEBUG
    //inf_displayInfo("Click pressed on " + iNodeID);

    //Handle lots of different sorts of clicks
    switch (iHandler) {
        case cintHandlerClientScript:
            nav_clickHandlerClient(iAction, iNodeID, iFilterID, iContext)
            break;

        case cintHandlerServerPopUp:
            nav_clickHandlerServer(iAction, iNodeID, iFilterID, iContext)
            break;

        default:
            err_systemError("nav_clickHandler", "Invalid Handler for " + iNodeID + ": " + iHandler)
            break;
    }
}

function nav_clickHandlerClient(iAction, iNodeID, iFilterID, iContext) {
    var iOverlaySwitch = ciOverlayDoNothing;

    /*
    var ciOverlayDoNothing			= 0;
    var ciOverlayCentre				= 1;
    var ciOverlayZoom				= 2;
    var ciOverlayPartialZoom		= 4;
    var ciOverlayShowInfo			= 8;
    */

    switch (iContext) {
        case cintContextMap:
            iOverlaySwitch = ciOverlayDoNothing;
            break;

        case cintContextExternal:
            iOverlaySwitch = ciOverlayCentre + ciOverlayPartialZoom;
            break;

        case cintContextResultsPane:
            iOverlaySwitch = ciOverlayCentre;
            break;

        case cintContextIndex:
            iOverlaySwitch = ciOverlayCentre;
            break;

        default:
            err_systemError("nav_clickHandlerClient", "Invalid Context for " + iNodeID + ": " + iHandler)
            break;
    }


    switch (iAction) {
        //Add an item to our index list to display the article              
        case cintActionDisplayArticle:
            //DEBUG
            //inf_displayInfo("Node: " + iNodeID + ", Filter: " + iFilterID + ", Switch: " + iOverlaySwitch);
            ajx_getArticle(iNodeID, iFilterID, iOverlaySwitch);
            break;

        default:
            err_systemError("nav_clickHandlerClient", "Invalid Action for " + iNodeID + ": " + iHandler)
            break;
    }
}


function nav_clickHandlerServer(iAction, iNodeID, iFilterID, iContext) {
    //Send the command to the server
    window.open('serverPopUp.aspx?action=' + iAction + '&filter=' + iFilterID + '&nodeid=' + iNodeID + '&context=' + iContext);
}



function nav_getNavData(strFilters) {
    var bOK = true;

    //Don't update the navigation if we are adding/editing an article
    if (iMapType == iAddMap) {
        return;
    }

    if (strFilters == "") {
        return;
    }

    //Build the Request String	
    var strRequestQuery = cstrNavDataRequestPage;
    strRequestQuery += "&filters=" + strFilters

    //DEBUG: Display request sting
    //inf_displayInfo(strRequestQuery);


    //Form and send the AJAX request.	
    $.ajax({
        url: strRequestQuery,
        dataType: "xml",
        async: true,
        success: function (data) {
            if (ajx_checkReturnedRequest(data, strRequestQuery)) {

                //Get the data out of the request.
                ajx_extractXMLData(data);

                //Update the Index
                ind_updateIndex();
            }
            else {
                strError = "Bad Request Object returned";
                bOK = false;
            }
        }
    });
    //    var request = GXmlHttp.create();
    //        
    //	request.open("GET", strRequestQuery, true);
    //	request.onreadystatechange = function()
    //	{
    //		if (request.readyState == 4)
    //		{
    //			if (request.status == 200)
    //			{
    //			
    //				//Check that the returned request object is OK
    //				if (ajx_checkReturnedRequest(request,strRequestQuery))			
    //				{
    //				
    //					//Get the data out of the request.
    //					ajx_extractXMLData(request);
    //				
    //					//Update the Index
    //					ind_updateIndex();
    //				}
    //				else
    //				{
    //					strError = "Bad Request Object returned";
    //					bOK = false;
    //				}
    //			}
    //			else
    //			{
    //				//Handle Request Failure
    //    			strError = "Request Status not valid";
    //    			bOK = false;
    //			}
    //		}
    //	}
    //	request.send(null);

    if (!bOK) {
        err_systemError("nav_getData", "Data Request Failed: Call Made: " + strRequestQuery + ", Error Details: " + strError);
    }
}



//----------------------
// INDEX FUNCTIONALITY
//----------------------

//This function called when mapData has been fetched from the DB
//This happens when a filter is turned on or the map coordinates have changed
function ind_updateIndex() {

    //This function
    //1) Process the XML sent back from the Server
    //2) Calls the AddIndexItem function for each item sent back.

    //var xmlDoc		= validRequest.responseXML;
    var nodeList = null;
    var iFilterID = 0;
    var bOK = true;
    var intSize = 0;

    //DEBUG
    //inf_displayInfo(gintXMLDataSize + " index articles found");

    //Add the articles to the list.	
    iFilterID = 0;

    //TODO - SHould be using gintXMLDataSize but it's wrong 
    //XML Returned from Server is wrong.  Look at datarequest?type=navdata for more info.
    //if (aXMLData[ciXMLNameIndex] == null)
    //{
    //	intSize = 0;
    //}
    //else
    //{
    //	intSize = aXMLData[ciXMLNameIndex].getSize();
    //}

    intSize = gintXMLDataSize;

    if (bOK) {
        for (var i = 0; i < intSize; i++) {
            var nodeid = aXMLData[ciXMLNodeIDIndex].getElementAt(i);
            var name = aXMLData[ciXMLNameIndex].getElementAt(i);
            var filterid = aXMLData[ciXMLFilterIDIndex].getElementAt(i);
            var filtername = aXMLData[ciXMLFilterNameIndex].getElementAt(i);
            var handler = parseInt(aXMLData[ciXMLHandlerIndex].getElementAt(i));
            var action = parseInt(aXMLData[ciXMLActionIndex].getElementAt(i));

            //Check that this filter is still turned on
            if (!aFilters.contains(filterid)) {
                //This filter has been turned off since we fetched the data.
                //Don't add the article to the index
                continue;
            }

            if (filterid != iFilterID) {
                ind_addIndexTitle(filtername);
                iFilterID = filterid;

            }

            //DEBUG
            //inf_displayInfo("Adding " + name + " to index");

            ind_addIndexItem(nodeid, name, filterid, handler, action);
        }
    }

    if (!bOK) {
        err_systemError("ind_updateIndex", "Could not add items to Index: " + strError);
    }
}


//TODO remove index functionality
//function ind_hideIndex()
//{
//document.getElementById(cstrDivIndexID).style.visibility="hidden";
//}

//function ind_showIndex()
//{
//	alert("show index");
//document.getElementById(cstrDivIndexID).style.visibility="visible";
//}

function ind_clearAllIndex() {
    var index = document.getElementById(cstrDivIndexID);
    index.innerHTML = "";
}

//TODO - Replace with Nested Tree
function ind_addIndexTitle(strTitle) {

    //Add the Title to the current list.
    var strHTML = "";
    var index = document.getElementById(cstrDivIndexID);

    //TODO Use style sheet for bold
    strHTML = "<b>" + strTitle + "</b></br>";

    if (index != null) {
        index.innerHTML += strHTML;
    }
}

function ind_addIndexItem(iNodeID, strName, iFilterID, iHandler, iAction) {

    var strHTML = "";
    var index = document.getElementById(cstrDivIndexID);
    var iContext = cintContextIndex;

    /*
    switch(iHandler)
    {
    case cintHandlerClientScript:
    strAction = ind_getClientScripIndexItem(iNodeID,iAction,iFilterID);
    break;
						
    case cintHandlerServerPopUp:
    strAction = ind_getServerPopUpIndexItem(iNodeID,strName,iFilterID,iAction);
    break;
		
    default:
    err_systemError("ind_addIndexItem", "Invalid Handler for " + strName + ": " + iHandler)
    break;
    }
    */

    //Append a Bullet Point
    strHTML = "- <a href='javascript:void(0)' ";
    strHTML += "onClick='nav_clickHandler(" + iHandler + "," + iAction + "," + iNodeID + "," + iFilterID + "," + iContext + ")'>";
    strHTML += strName + "</a><br />";


    //Add the index item if we have a handle on our index DIV
    if (index != null) {
        index.innerHTML += strHTML;
    }
}



function fil_turnOnFilters(varFilters, bDisplayList) {
    //Check strFilters is string an not a single integer
    //being passed in
    var strFilters = String(varFilters);

    var aNewFilters = strFilters.split(cstrFilterDelimiter);
    var iFilterID = 0;

    for (var i = 0; i < aNewFilters.length; i++) {
        //Tick the box in the Filter Tree
        tre_turnOnStateNodesByFilterID(aNewFilters[i]);
    }

    //Now call the main toggleFilters function
    //to act on the changes
    nav_toggleFilters(strFilters, bDisplayList);

}

function fil_turnOffFilters(varFilters, bDisplayList) {

    //Check strFilters is string an not a single integer
    //being passed in
    var strFilters = String(varFilters);

    var aNewFilters = strFilters.split(cstrFilterDelimiter);
    var iFilterID = 0;

    for (var i = 0; i < aNewFilters.length; i++) {
        //Tick the box in the Filter Tree
        tre_turnOffStateNodesByFilterID(aNewFilters[i]);
    }

    //Now call the main toggleFilters function
    //to act on the changes
    nav_toggleFilters(strFilters, bDisplayList);

}


//This function called when a filter check box is toggled.
//This function name also used in Navigator
//when building filter list. These function names must match.
/*
function nav_toggleFilter(iFilterID)
{
    
//Do we need to add or remove filters?
if (tre_isTicked(iFilterID))
{
//Make sure this filter is added to our list
if (!aFilters.contains(iFilterID))
{
//Make sure this filter is added to our list
//TODO - Do we want to add this to the beginning of our list
//to affect the order of the results list?
aFilters.addElement(iFilterID);    

//Update the navigation (map/index) to reflect the change
fil_processFilters();
}	
}

else
{
    
//Remove this item from the list of filters
if (aFilters.contains(iFilterID))
{
var index = aFilters.indexOf(iFilterID);
        
//Does this filter exist in our aFilters array?
if (index >= 0)
{
//Remove the Filter from our index
aFilters.removeElementAt(index);

//TODO - Is this code correct now that filter functionality 
// has changed?

//Now update navigation accordingly
fil_clearFilter(iFilterID);
                
}
}        
}
    
//Now update cookie
	
//Build up Cookie String
var strFilters = fil_getFiltersString();
        
//Write a cookie
SetCookie(cstrFilterField,strFilters,cookieExpiryDate);
		
//DEBUG
//inf_displayInfo(document.strFilters);
}
*/


// ----------------------
// TOOLBAR CODE
// ----------------------

function tbr_updateToolbar() {
    tbr_resetToolbar();
    tbr_populateToolbar();
}


function tbr_clearDivToolbarByID(intDivID) {
    //DEBUG
    //alert("Clearing Toolbar " + intDivID);

    if ((intDivID + 1) > aDivToolbars.length) {
        err_systemError("Div toolbars not initialised");
        return;
    }

    //Get a handle on the toolbar for this DIV
    var aDivToolbar = aDivToolbars[intDivID];
    if (aDivToolbar == null) {
        err_systemError("tbr_clearDivToolbarByID", "Could not find toolbar for Div: " + intDivID);
        return;
    }

    //TODO - remove integer - use constant
    var vToolbarName = aDivToolbar[0];
    var vToolbarTip = aDivToolbar[1];
    var vToolbarLabel = aDivToolbar[2];

    vToolbarName.removeAllElements();
    vToolbarTip.removeAllElements();
    vToolbarLabel.removeAllElements();


}

function tbr_buildDivToolbar(strDivName, strItemName, strItemTip, strItemLabel) {
    var intDivID = div_getID(strDivName);
    tbr_buildToolbarByID(intDivID, strItemName, strItemTip, strItemLabel);
}

function tbr_buildToolbarByID(intDivID, strItemName, strItemTip, strItemLabel) {
    //DEBUG
    //alert("Adding to toolbar " + strItemName);

    if ((intDivID + 1) > aDivToolbars.length) {
        err_systemError("Div toolbars not initialised");
        return;
    }

    //Get a handle on the toolbar for this DIV
    var aDivToolbar = aDivToolbars[intDivID];
    if (aDivToolbar == null) {
        err_systemError("tbr_buildToolbarByID", "Could not find toolbar for Div: " + intDivID);
        return;
    }

    //TODO - remove integer - use constant
    var vToolbarName = aDivToolbar[0];
    var vToolbarTip = aDivToolbar[1];
    var vToolbarLabel = aDivToolbar[2];

    //DEBUG
    //inf_displayInfo("Adding toolbar item: " + strItemName + "," + strItemLabel + " to Div " + intDivID);

    vToolbarName.addElement(strItemName);
    vToolbarTip.addElement(strItemTip);
    vToolbarLabel.addElement(strItemLabel);

    //DEBUG
    //alert("Toobar now " + vToolbarName.getSize());
}


function tbr_resetToolbar() {

    //Clear out old toolbar
    var toolbarDiv = document.getElementById("toolbarBox");

    //TODO - Does this method of clearing out a toolbar lead to memory leaks?
    toolbarDiv.innerHTML = "";
    toolbar = null;
    toolbar2 = null;

    if (iMapType == iBrowseMap) {
        //Create new toolbar
        toolbar = new dhtmlXToolbarObject("toolbarBox", "100%", "20", "");

        //TODO - change ini xml file name
        toolbar.loadXML("article_toolbar.xml");
        toolbar.setOnClickHandler(tbr_onButtonClick);

        //Show toolbar
        toolbar.showBar();
        //toolbar2.hideBar();
    }
    else {
        // Do Nothing
    }
}

function tbr_populateToolbar() {
    var bItemAdded = false;

    //DEBUG
    //alert("Populating Tool Bar for pane: " + gintCurrentPane);

    //Find out what toolbars we are to show
    //We find that out by looking at our pane.

    //Get a handle on our list of DIVs in this pane
    vPaneDiv = aPaneDivs[gintCurrentPane]

    //DEBUG
    //alert("Adding in toolbars from " + vPaneDiv.getSize() + " divs");

    //Loop through each DIV in this Pane
    for (var i = 0; i < vPaneDiv.getSize(); i++) {
        //Loop through each DIV defined
        for (var j = 0; j < aDivs.length; j++) {
            //Is this DIV in our Pane?
            if (aDivs[j] == vPaneDiv.getElementAt(i)) {
                //DEBUG
                //alert("Adding toolbar for DIV: " + aDivs[j]);



                //TODO - swap integers for constants
                //Get a handle on our stored toolbar for this DIV
                vToolbarName = aDivToolbars[j][0];
                vToolbarTip = aDivToolbars[j][1];
                vToolbarLabel = aDivToolbars[j][2];

                //Check sizes match
                if (vToolbarName.getSize() != vToolbarTip.getSize()) {
                    err_systemError("tbr_populateToolbar", "Toolbar Name and Tip sizes don't match");
                }
                if (vToolbarName.getSize() != vToolbarLabel.getSize()) {
                    err_systemError("tbr_populateToolbar", "Toolbar Name and Label sizes don't match");
                }

                //Add in a divider if we have added items to the toolbar
                //and if this is not the last DIV toolbar
                if (bItemAdded && vToolbarName.getSize() > 0) {
                    tbr_addToolbarDivider(i);

                    //Reset Flag
                    bItemAdded = false;
                }


                //Add in Toolbar items
                //var intToolbarButtonType = cintToolbarImageButton;
                var intToolbarButtonType = cintToolbarTextButton;
                //var intToolbarButtonType = cintToolbarImageButton + cintToolbarTextButton;
                for (var k = 0; k < vToolbarName.getSize(); k++) {
                    tbr_addToolbarItem(vToolbarName.getElementAt(k), vToolbarTip.getElementAt(k), vToolbarLabel.getElementAt(k), intToolbarButtonType);
                    bItemAdded = true;
                }


            }
        }
    }
}


function tbr_addToolbarItem(strName, strTooltip, strLabel, intButtonType) {
    //DEBUG
    //alert("Adding " + strName + "(" + strLabel + "," + strTooltip + ") to toolbar");


    var intBoth = cintToolbarImageButton + cintToolbarTextButton;

    switch (intButtonType) {
        case cintToolbarImageButton:
            toolbar.addItem(new dhtmlXImageButtonObject('imgs/icon' + strName + '.gif', 20, 18, 0, strName, strTooltip));
            break;

        case cintToolbarTextButton:
            toolbar.addItem(new dhtmlXImageTextButtonObject('imgs/icondummy.gif', strLabel, 10 + parseInt(strLabel.length) * 6, 18, 0, strName, strTooltip));
            break;

        case intBoth:
            toolbar.addItem(new dhtmlXImageTextButtonObject('imgs/icon' + strName + '.gif', strLabel, 30 + parseInt(strLabel.length) * 6, 18, 0, strName, strTooltip));
            break;

        default:
            err_systemError("tbr_addToolbarItem", "Invalid button type specified");
            break;
    }

}

function tbr_addToolbarDivider(intIndex) {
    toolbar.addItem(new dhtmlXToolbarDividerXObject('div' + intIndex));
}

function tbr_onButtonClick(itemID, itemValue) {
    //DEBUG
    //alert(itemID + " - " + itemValue);

    switch (itemID) {
        //case "filter":              
        //nav_toggleFilterList(itemValue);              
        //break;              

        case "new":
            window.location = "addchoose.aspx";
            break;

        case "search":
            break;

        case "edit":
            window.location = cstrMainPage + "?page=edit&nodeid=" + intXMLNodeID;
            break;

        case "delete":
            nav_confirmRedirect("Are you sure you want to delete this article?", cstrMainPage + "?page=delete&nodeid=" + intXMLNodeID);
            break;

        case "showonmap":
            ajx_showArticleOnMap(intXMLNodeID, intXMLPreferredFilterID, ciOverlayCentre);
            break;

        case "addfavourite":
            //TODO - Change Project Name to dynamic setting
            art_addToFavourites(strXMLLink, strXMLName + " - Boatlaunch");
            break;

        case "refresh":
            ajx_getArticle(intXMLNodeID, intXMLPreferredFilterID, ciOverlayDoNothing);
            break;

        case "copylink":
            art_copyhref(strXMLLink);
            break;

        case "emaillink":
            window.location = strXMLEmailLink;
            break;

        case "resetmap":
            map_resetMap();
            break;


        default:
            err_systemError("tbr_onButtonClick", "Invalid Button ID");
            break;


    }
}




function nav_toggleFilters(strFilters, bDisplayList) {

    //This function is the same as nav_toggleFilter but
    //can handle a list of filters and not just one.

    //First Break down the list of filters into an array
    var aNewFilters = strFilters.split(cstrFilterDelimiter);
    var iFilterID = 0;
    var bFiltersTurnedOn = false;
    var bFiltersTurnedOff = false;

    //Now process each filter
    for (var i = 0; i < aNewFilters.length; i++) {
        //Extract the filter
        iFilterID = aNewFilters[i];

        //Do we need to add or remove filters?
        if (tre_isTicked(iFilterID)) {
            //Make sure this filter is added to our list
            if (!aFilters.contains(iFilterID)) {
                //Make sure this filter is added to our list
                //TODO - Do we want to add this to the beginning of our list
                //to affect the order of the results list?
                aFilters.addElement(iFilterID);

                //Make a note that a filter has been turned on
                bFiltersTurnedOn = true;
            }
        }
        else {
            //Remove this item from the list of filters
            if (aFilters.contains(iFilterID)) {
                var index = aFilters.indexOf(iFilterID);

                //Does this filter exist in our aFilters array?
                if (index >= 0) {
                    //Remove the Filter from our index
                    aFilters.removeElementAt(index);

                    //Make a note that a filter has been turned on
                    bFiltersTurnedOff = true;
                }

                //Process any actions required
                fil_clearFilter(iFilterID);
            }
        }
    }

    //Update the navigation (map/index) to reflect the change
    //if there has been a change.
    if (bFiltersTurnedOn || bFiltersTurnedOff) {
        fil_processFilters(bDisplayList);
    }

    //Now update cookie
    //Build up Cookie String
    var strFilters = fil_getFiltersString();

    //Write a cookie
    SetCookie(cstrFilterField, strFilters, cookieExpiryDate);

}


function nav_confirmRedirect(strPrompt, strURL) {

    //This function will ask a user if they are sure they want to follow a
    //hyperlink before doing it.
    //It is used for removing a category and deleting articles
    if (confirm(strPrompt)) {
        window.location = strURL;
    }
}

function nav_confirmSubmit(strPrompt, strFormName) {
    //This function will ask a user if they are sure they want to submit
    //a form
    //It is used for adding a category to an existing article
    //TODO: does not work in firefox

    if (confirm(strPrompt)) {
        //alert("getting form");
        var form = document.getElementById(strFormName);

        if (form) {
            //alert(strFormName);
            form.submit();
        }
        else {
            //alert('cannot submit');
        }
    }
}


function inf_showHelp(strHelp) {
    //TODO Put in decent help pop up
    alert(strHelp);

}

// A Rectangle is a simple overlay that outlines a lat/lng bounds on the
// map. It has a border of the given weight and color and can optionally
// have a semi-transparent background color.
function Rectangle(bounds, html, style) {
    this.bounds_ = bounds;
    //this.weight_ = opt_weight || 2;
    //this.weight_ = 2;
    //this.bordercolour_ = opt_color || "#888888";
    //this.bordercolour_ = "#888888";
    this.html_ = html;
    this.style_ = style;
    this.setMap(map);
}


function inf_displayInfoWindow(strInfo) {

    //Display a pop up window on the map
    if (map) {

        //Rectangle.prototype = new GOverlay();
        Rectangle.prototype = new google.maps.OverlayView();

        // Creates the DIV representing this rectangle.
        Rectangle.prototype.onAdd = function (map) {
            // Create the DIV representing our rectangle
            var div = document.createElement("div");
            //div.style.border = this.weight_ + "px solid " + this.color_;
            div.style.position = "absolute";

            // Our rectangle is flat against the map, so we add our selves to the
            // MAP_PANE pane, which is at the same z-index as the map itself (i.e.,
            // below the marker shadows)
            //map.getPane(G_MAP_MAP_PANE).appendChild(div);
            //// map.getPane(G_MAP_FLOAT_PANE).appendChild(div);
            this.getPanes(google.maps.MAP_FLOAT_PANE).overlayLayer.appendChild(div);

            this.map_ = map;
            this.div_ = div;
        }

        // Remove the main DIV from the map pane
        Rectangle.prototype.onRemove = function () {
            this.div_.parentNode.removeChild(this.div_);
        }

        // Copy our data to a new Rectangle
        Rectangle.prototype.copy = function () {
            return new Rectangle(this.bounds_, this.weight_, this.color_,
                       this.backgroundColor_, this.opacity_);
        }

        // Redraw the rectangle based on the current projection and zoom level
        Rectangle.prototype.draw = function (force) {
            // We only need to redraw if the coordinate system has changed
            ////if (!force) return;

            // Calculate the DIV coordinates of two opposite corners of our bounds to
            // get the size and position of our rectangle
            // var c1 = this.map_.fromLatLngToDivPixel(this.bounds_.getSouthWest());
            // var c2 = this.map_.fromLatLngToDivPixel(this.bounds_.getNorthEast());

            var proj = this.getProjection();
            var c1 = proj.fromLatLngToDivPixel(this.bounds_.getSouthWest());
            var c2 = proj.fromLatLngToDivPixel(this.bounds_.getNorthEast());

            // Now position our DIV based on the DIV coordinates of our bounds
            this.div_.style.width = Math.abs(c2.x - c1.x) + "px";
            this.div_.style.height = Math.abs(c2.y - c1.y) + "px";
            this.div_.style.left = (Math.min(c2.x, c1.x)) + "px";
            this.div_.style.top = (Math.min(c2.y, c1.y)) + "px";

            this.div_.innerHTML = this.html_;
            this.div_.className = this.style_;

        }


        // Display a rectangle in the center of the map at about a quarter of
        // the size of the main map
        var bounds = map.getBounds();
        var southWest = bounds.getSouthWest();
        var northEast = bounds.getNorthEast();
        var cen = bounds.getCenter();
        var lngDelta = (cen.lng() - southWest.lng()) / 8;
        var latDelta = (cen.lat() - southWest.lat()) / 8;

        var rectPoint = new google.maps.LatLngBounds(
            new google.maps.LatLng(southWest.lat() + (2 * latDelta), southWest.lng() + lngDelta),
            new google.maps.LatLng(southWest.lat() + (4 * latDelta), southWest.lng() + (7 * lngDelta)));
        //        var rectBounds = new GLatLngBounds(
        //			new GLatLng(southWest.lat() + (2 * latDelta), southWest.lng() + lngDelta),
        //			new GLatLng(southWest.lat() + (4 * latDelta), southWest.lng() + (7 * lngDelta)));

        //Remove the old overlay if we have one
        inf_hideInfoWindow();

        //Create a new overlay
        //infoOverlay = new google.maps.Rectangle(rectBounds, strInfo, 'infoPopUp');
        infoOverlay = new Rectangle(rectPoint, strInfo, 'infoPopUp');

        //Add it to the map		
        //map.addOverlay(infoOverlay);
        //infoOverlay.setMap(map);
        //// this.setMap(map);
    }
    else {
        err_systemError("inf_displayInfoWindow", "Map does not exist");
    }

}

function inf_hideInfoWindow() {
    if (map) {
        //Remove the old overlay if we have one
        if (infoOverlay) {
            infoOverlay.setMap(null);
            //map.removeOverlay(infoOverlay);		
        }
    }
}


function inf_displayInfo(strInfo) {
    var info = document.getElementById(cstrDivInfoID);
    var strNewInfo = "";
    var i = 0;

    //Store the new info
    for (i = 0; i < aInfoLines.length - 1; i++) {
        aInfoLines[i] = aInfoLines[i + 1];
    }
    aInfoLines[i] = strInfo;


    //Now display the info
    strNewInfo += "<b>" + aInfoLines[aInfoLines.length - 1] + "</b>";
    strNewInfo += "<br />";
    for (i = aInfoLines.length - 2; i >= 0; i--) {
        strNewInfo += aInfoLines[i];
        strNewInfo += "<br />";
    }

    if (info != null) {
        try {
            info.innerHTML = strNewInfo;
        }
        catch (err) {
            //Do nothings
        }
    }


}

// ---------------------
// ARTICLE FUNCTIONALITY
// ---------------------

function art_addToFavourites(urlAddress, pageName) {
    //NOTE: This firefox/mozilla code does not work very well.
    //if (window.sidebar)
    //{ // firefox
    //	window.sidebar.addPanel(pageName, urlAddress, "");
    //}
    if (window.external) {	//MSIE
        window.external.AddFavorite(urlAddress, pageName)
    }
    else {
        alert("We are sorry but your browser does not support this function.");
    }
}

function art_copyhref(str) {
    //TODO - Do a better check to see if we are using IE or not.
    if (window.external) {
        window.event.returnValue = false; //stops the event from bubbling
        window.clipboardData.setData("Text", str);
        alert("A link to this page has been copied to your clipboard.\nYou can paste it into a document or an email.")
    }
    else {
        prompt('Please copy the link to this page\nYou can then paste it into a document or an email.', str);
    }
}


//Function to toggle the submit button on and off
function toggleSubmit() {
    var ckb = document.getElementById(cstrCheckBoxTermsAndConditions);
    var btn = document.getElementById(cstrSubmit);

    if (ckb.checked) {

        btn.disabled = false;
    }
    else {
        btn.disabled = true;
    }

}


// ---------------------------
// FILTER FUNCTIONALITY
// ---------------------------

//This function called when a filter is turned on.

//This function is called whenever filters are turned on or off.
//It updates the map, fetching nodes for all filters turned on.
//It also updates the results list, fetching nodes for all filters turned on.

//NOTE: This may seem inefficient because we are fetching nodes for locations
//      that already exist on the map.  However, by fetching nodes for all
//      selected filters, we can make sure that we are not putting too many
//      markers on the map.

function fil_processFilters(bDisplayList) {

    //DEBUG
    //inf_displayInfo("Processing Filter Selections...");

    var strFilters = fil_getFiltersString();

    //Don't update the navigation if we are adding/editing an article.
    if (iMapType == iAddMap) {
        return;
    }


    //When the page is initially building, the map object
    //may not yet exist, so only update the map if it's available.
    if (map) {
        ajx_getMapData(strFilters);
    }

    //Update the Index
    //nav_getNavData(strFilterID);

    //Reset Page Number
    gintResultsPageNumber = 1;

    //Update the Results List with all filters
    nav_getList(strFilters, gintResultsPageNumber, bDisplayList);

}

//This function will remove markers from a map
//for the selected filter.

//This function does not need to clear out the
//results list because after this function is called,
//the toggleFilters function will call processFilters
//which will fetch the entire results list and map data
//again.

function fil_clearFilter(iFilterID) {

    var strFilters = "";

    //Update the Map
    if (map) {
        fil_clearFilterMarkers(iFilterID);
    }

    //TODO - maintain state of index so we don't have to
    //Wipe it all out and then rebuild it all.

    //Clear the Index
    //ind_clearAllIndex();

    //Build up list of all filters.
    //strFilters = fil_getFiltersString();   

    //Update the Index with all filters
    //nav_getNavData(strFilters)

    //Reset Page Number
    //gintResultsPageNumber = 1;

    //Update the Results list
    //nav_getList(strFilters,gintResultsPageNumber);

    //Tell the user what's going on
    //inf_displayInfo("Filter " + iFilterID + " removed");

}


function fil_clearFilterMarkers(iFilterID) {
    //Clear the markers out for this filter
    var vNodes = aMarkers[ciNodeIndex];
    var vMarkers = aMarkers[ciMarkerIndex];
    var vFilters = aMarkers[ciFilterIndex];
    var vMarkerList;
    var vFilterList;

    var bEndFilter = false;

    //DEBUG
    //alert("Clearing Filter " + iFilterID + ", parsing " + vNodes.getSize() + " nodes");


    //Loop through our list of filters
    for (var i = 0; i < vNodes.getSize(); i++) {
        vFilterList = vFilters.getElementAt(i);
        vMarkerList = vMarkers.getElementAt(i);

        if (!vFilterList.contains(iFilterID)) {
            continue;
        }

        //This Marker/Article/Node is part of
        //the filter to clear.

        //Find out what filter we want in our list of filters for this node.
        var index = vFilterList.indexOf(iFilterID);

        //DEBUG
        //alert("Found node at index " + index + " and size is " + vFilterList.getSize());

        //Are we dealing with the filter/marker at the end of our list?
        if (index == vFilterList.getSize() - 1) {
            bEndFilter = true;
        }

        //If this is the end Marker, then remove it from the map.
        if (bEndFilter) {
            //This is the last marker in the list.
            //It is therefore currently being displayed on the map

            //Identify the marker
            var marker = vMarkerList.getElementAt(index);

            //Remove the marker from the map
            map.removeOverlay(marker);
        }

        //Remove this filter from the filter list
        vFilterList.removeElementAt(index);

        //Now remove the marker from our marker list
        vMarkerList.removeElementAt(index);



        //Are there any filters remaining?
        if (vFilterList.getSize() == 0) {
            //Identify the marker
            var marker = vMarkers.getElementAt(i);

            //Remove this Marker/Article/Node altogether
            vNodes.removeElementAt(i);
            vMarkers.removeElementAt(i);
            vFilters.removeElementAt(i);

            //Remove the marker from the map
            map.removeOverlay(marker);

            //We may have mucked up our iteration.
            //Go one step back to make sure we don't miss any.
            i--;
        }
        else {
            //We have filters/markers remaing for this node.
            //Make sure we have the last marker recorded displayed.

            //If we have removed the end Marker, we need to display the new end marker
            if (bEndFilter) {
                //Identify the marker
                var marker = vMarkerList.getLastElement();

                //Add the marker to the map
                map.addOverlay(marker);
            }
        }
    }

}

function fil_getFiltersString() {

    var strFilters = "";

    //Do we have any filters to display?
    if (aFilters.size == 0) {
        return strFilters;
    }

    //Build up list of filters we want data for
    for (var i = 0; i < aFilters.size - 1; i++) {
        strFilters += aFilters.getElementAt(i) + cstrFilterDelimiter;
    }
    //Add on the last filter but without a delimiter!
    strFilters += aFilters.getElementAt(i);

    return strFilters;
}


function inf_toggleIndicator(iIndicator, bOn) {

    var ind = document.getElementById("indicator" + iIndicator);

    if (bOn) {
        ind.style.visibility = "visible";
    }
    else {
        ind.style.visibility = "hidden";
    }
}



// ------------------
// TREE FUNCTIONALITY
// ------------------

// uses Tigra Tree Menu Pro
// http://www.softcomplex.com/products/tigra_tree_menu_pro/docs

//TODO - Make sure calls to child tre_selectChildren/Parent does not bombard toggleFilter

function tre_onItemSelectHandler(node) {
    var strFilters = "";
    var bDisplayList = false;

    if ((node.n_state & 4) == 0) {
        node.n_state = node.n_state | 4; //mark item as selected - needed for setting parent icons		
        node.selsave(); // save to cookie
        var o_state = node.state();
        if (o_state['node']) {
            strFilters = tre_selectChildren(node, true); // select children only if a node is deselected
        }
        if (node.n_depth > 1) {
            var parentNode = node;
            for (var i = 1; i < node.n_depth; i++) {
                parentNode = parentNode.o_parent;
            }
            tre_setParentIcons(parentNode, true); // deselect and show grey tick on branch nodes where appropriate
        }
    }

    //Now update everything else
    var filterID = node.a_config[2].filterID;
    strFilters += filterID;

    //DEBUG
    //alert("Toggling the following filters: " + strFilters);

    nav_toggleFilters(strFilters, bDisplayList);

    return true; //call default handler
}

function tre_onItemDeselectHandler(node) {
    var strFilters = "";
    var filterID = 0;
    var bDisplayList = false;

    if ((node.n_state & 4) == 4) {
        node.n_state = node.n_state ^ 4; //mark item as deselected - needed for setting parent icons
        node.selsave(); // save to cookie
        var o_state = node.state();
        if (o_state['node']) {
            strFilters = tre_selectChildren(node, false); // deselect children only if a node is selected
        }
        if (node.n_depth > 1) {
            var parentNode = node;
            for (var i = 1; i < node.n_depth; i++) {
                parentNode = parentNode.o_parent;
            }
            strFilters += tre_setParentIcons(parentNode, false); // deselect and show grey tick on branch nodes where appropriate
        }
    }

    //Now update everything else
    filterID = node.a_config[2].filterID;
    strFilters += filterID;

    //DEBUG
    //alert("Toggling the following filters: " + strFilters);

    nav_toggleFilters(strFilters, bDisplayList);

    return true; //call default handler
}


function tre_selectChildren(node, b) {
    var childNodes = node.a_children;
    var strFilters = "";
    try {
        for (var i = 0; i < childNodes.length; i++) {
            if (b) {
                childNodes[i].n_state = childNodes[i].n_state | 4;  // select item
                childNodes[i].state_lookup(); // refresh the display
                childNodes[i].selsave(); // save to cookie
            }
            else {
                if ((childNodes[i].n_state & 4) == 4) {
                    childNodes[i].n_state = childNodes[i].n_state ^ 4; //deselect item
                    childNodes[i].state_lookup(); // refresh the display
                    childNodes[i].selsave(); // save to cookie
                }
            }
            strFilters += tre_selectChildren(childNodes[i], b);

            //Now update everything else
            var filterID = childNodes[i].a_config[2].filterID;
            strFilters += String(filterID) + "-";
        }
        tre_whiteNode(node);

        return strFilters;

    }
    catch (e) {
        return "";
    }
}


function tre_setParentIcons(node, bReturnSelectedFilters) {
    var childNodes = node.a_children;
    var sel = 0; // no. of selected child nodes
    var deSel = 0; // no. of deselected child nodes
    var grey = 0; // no. of grey child nodes	

    var filterID = ""
    var strFilters = "";

    if (node.a_config[2]) {
        filterID = node.a_config[2].filterID;
    }

    try {
        for (var i = 0; i < childNodes.length; i++) {
            try {
                if (childNodes[i].a_children.length != 'undefined') {
                    strFilters += tre_setParentIcons(childNodes[i], bReturnSelectedFilters);
                }
            }
            catch (e) { }
            if ((childNodes[i].n_state & 4) == 4) sel++;
            if ((childNodes[i].n_state & 4) == 0) deSel++;
            if (childNodes[i].a_config[2].i0 == cstrGreyTick) grey++;
            //	alert('child: ' + childNodes[i].a_config[0] + ' (' + (childNodes[i].n_state & 4) + ')\nsel=' + sel + '\ndeSel=' + deSel + '\ngrey=' + grey)
        }
        if (((sel != 0) && (deSel != 0)) || (grey != 0)) { // 1+ selected AND 1+ deselected OR 1+ grey child so node must be grey
            node.a_config[2].i0 = cstrGreyTick
            node.a_config[2].i8 = cstrGreyTick
            node.a_config[2].i64 = cstrGreyTick
            node.a_config[2].i72 = cstrGreyTick
            if ((node.n_state & 4) == 4) node.n_state = node.n_state ^ 4; //deselect node if necessary
            node.state_lookup() // refresh the display
            node.save(); // save to cookie	
            //	alert(node.a_config[0] + ' is grey')	

            //Make a note of this node's filter ID for passing back
            if (bReturnSelectedFilters) {
                strFilters += filterID + cstrFilterDelimiter;
            }
            else {
                strFilters += "";
            }
        }
        else if ((deSel == 0) && ((node.n_state & 4) == 0)) {// node is deselected but all child nodes are selected
            node.n_state = node.n_state | 4; //mark item as selected	
            tre_whiteNode(node); // reset the node icons
            //alert(node.a_config[0] + ' is selected')

            //Make a note of this node's filter ID for passing back
            if (bReturnSelectedFilters) {
                strFilters += filterID + cstrFilterDelimiter;
            }
            else {
                strFilters += "";
            }
        }
        else if (sel == 0) {// all child nodes are deselected so node must be deselected
            if ((node.n_state & 4) == 4) node.n_state = node.n_state ^ 4;
            tre_whiteNode(node); // reset the node icons
            //	alert(node.a_config[0] + ' is deselected')	

            //Make a note of this node's filter ID for passing back
            if (bReturnSelectedFilters) {
                strFilters += "";
            }
            else {
                strFilters += filterID + cstrFilterDelimiter;
            }
        }
        else { // node is already selected and doesn't need to be changed
            //	alert(node.a_config[0] + ' (' + (node.n_state & 4) + ')\nsel=' + sel + '\ndeSel=' + deSel + '\ngrey=' + grey)

            //Make a note of this node's filter ID for passing back
            if (bReturnSelectedFilters) {
                strFilters += filterID + cstrFilterDelimiter;
            }
            else {
                strFilters += "";
            }
        }
        node.selsave(); // save to cookie
    }
    catch (e) {
        return;
    }

    return strFilters;
}

function tre_whiteNode(node) {
    node.a_config[2].i0 = cstrBox
    node.a_config[2].i8 = cstrBox
    node.a_config[2].i64 = cstrBox
    node.a_config[2].i72 = cstrBox
    node.state_lookup() // refresh the display
    node.save(); // save to cookie
    //	alert(node.a_config[0] + ' is white')
}



function tre_turnOnStateNodesByFilterID(n) {
    //This function puts ticks in the tree for the specified filterID
    var a_found = TREES['filters'].find_item_by_key('filterID', n);
    for (var i = 0; i < a_found.length; i++) {
        a_found[i].n_state = a_found[i].n_state | 4;  // select item
        a_found[i].state_lookup(); // refresh the display
        a_found[i].selsave(); // save to cookie
    }
}

function tre_turnOffStateNodesByFilterID(n) {
    //This function takes ticks out of the tree for the specified filterID
    var a_found = TREES['filters'].find_item_by_key('filterID', n);
    for (var i = 0; i < a_found.length; i++) {
        a_found[i].n_state = a_found[i].n_state ^ 4;  // select item
        a_found[i].state_lookup(); // refresh the display
        a_found[i].selsave(); // save to cookie
    }
}




function tre_isTicked(iFilterID) {
    var bIsTicked = false;
    var a_found = TREES['filters'].find_item_by_key('filterID', iFilterID);

    for (var i = 0; i < a_found.length; i++) {
        if (a_found[i].n_state & 4) {
            bIsTicked = true;
        }
    }
    return bIsTicked;
}


// ------------------
// ERROR HANDLING
// ------------------

function err_systemError(strFunction, strInfo) {
    var sHTML = "";
    var errDiv = document.getElementById(cstrDivErrID)

    //Check we have error information
    if (strFunction == "") {
        strFunction = "Unknown Function";
    }
    if (strInfo == "") {
        strInfo = "Unknown Error";
    }


    errDiv.style.height = cstrErrorBoxHeight;

    if (errDiv.innerHTML == "") {
        sHTML = "An error has occured.<br />";
        sHTML += "Please send us details of this error so that we may fix it.<br /><br />";
        //sHTML += "Clicking on Send Error, below, will automatically send us an email<br />";
        //sHTML += "containing the following information:<br />";
    }


    sHTML += "<br />";
    sHTML += "URL: " + window.location + "<br />";
    sHTML += "Function: " + strFunction + "<br />";
    sHTML += "Details: " + strInfo + "<br />";

    sHTML += "<input type='button' value='Hide Error' onClick='err_hideError()'>";

    /*
    sHTML += "<form action='" + strErrorEmail + "' method='post' enctype='text/plain' >"
    sHTML += "<input type='hidden' name='URL' value='" + window.location + "'>"
    sHTML += "<input type='hidden' name='Function' value='" + strFunction + "'>"
    sHTML += "<input type='hidden' name='Info' value='" + strInfo + "'>"
    sHTML += "<input type='button' value='Hide Error' onClick='err_hideError()'>";
    sHTML += "<input type='submit' name='submit' value='Send Error'>";
    sHTML += "</form>"
    */

    //TODO Implement Email send
    //Or should we do an AJAX call to send the error data up to the server.  Needs to be robust?
    //sHTML += "<input type='button' value='Send Error' onClick='err_hideError()'>";

    //Append error HTML to end of list
    try {
        errDiv.innerHTML = errDiv.innerHTML + sHTML;
    }
    catch (err) {
        alert("Error displaying error: " + sHTML + " - " + err.description);
    }
}


function err_userError(strInfo) {

    var sHTML = "";
    var errDiv = document.getElementById(cstrDivErrID)

    errDiv.style.height = cstrErrorBoxHeight;

    sHTML += "A problem has occured. Please review the error below:<br /><br />";
    sHTML += strInfo;

    //sHTML += "<br /><input type='button' value='Hide' onClick='err_hideError()'>";

    //TODO Implement Email send
    //Or should we do an AJAX call to send the error data up to the server.  Needs to be robust?
    //sHTML += "<input type='button' value='Send Error' onClick='err_hideError()'>";

    errDiv.innerHTML = sHTML;

}

function err_hideError() {
    var errDiv = document.getElementById(cstrDivErrID)

    errDiv.innerHTML = "";

    errDiv.style.height = "0px";


}
function goo_refreshAdUsingContent(queryString) {
    try {
        var d = document.getElementById('adcontent');
        if (d) {
            var articlePage = "adcontent.aspx";
            var newSource = queryString.replace("dataRequest.aspx", articlePage);

            //Add in any keywords    
            newSource += "&k=" + strXMLKeywords;
            d.src = newSource;
            //alert(d.src);
        }
        return true;
    }
    catch (err) {
        err_systemError("goo_refreshAdUsingContent", err.description);
    }

}

function goo_refreshAdUsingKeywords(iframeNumber, keywords) {
    try {
        var d = document.getElementById('adkeyword' + iframeNumber);

        if (d) {
            var articlePage = "adkeyword.aspx";
            var newSource = articlePage;
            //Add in any keywords    
            newSource += "?k=";
            newSource += keywords;
            d.src = newSource;
            //alert(d.src);
        }
    }
    catch (err) {
        err_systemError("goo_refreshAdUsingKeywords", err.description);
    }
    return true;
}

function goo_getIFrame(strName, intWidth, intHeight) {
    var strIFrame = "<iframe id='" + strName + "' name='" + strName + "'";
    strIFrame += " height='" + intHeight + "' width='" + intWidth + "' ";
    strIFrame += " marginheight='0' marginwidth='0' frameborder='0' scrolling='no' ></iframe>";
    return strIFrame;
}