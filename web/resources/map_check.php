<?php

/**
 * The Hello World of Tonic
 *
 * This example outputs a simple hello world message and the details of the
 * request and response as generated by Tonic. It also demonstrates etags and
 * "if none match" functionality.
 *
 * @namespace GCTour\API\Map\Check
 * @uri /map/check
 */
class MapCheckResource extends Resource {


    
    function post($request) {
	    $response = new Response($request);
		
	   	if (isset($_POST['gcIds']) && isset($_POST['wptIds'])) {
            $gcids = explode(",",$_POST['gcIds']);
            $wptIds = explode(",",$_POST['wptIds']);     
            
            $missing_gcids = array();
            $missing_waypoints = array();       
     
            $db = Database::obtain();     
            
            // create the tempoaray table            
            $db->query("CREATE TEMPORARY TABLE mapcheck_memory(ids varchar(128)) ENGINE=MEMORY;");
            
            // insert all gcids
            if(!empty($_POST['gcIds'])){           
              $values = implode(",", array_map(array($this, "add_braces"), $gcids));                      
              $db->query("INSERT INTO `mapcheck_memory` VALUES ".$values.";");       
              // and get all ids which are not in the geocaches table
              $missing_gcids = $db->fetch_array("SELECT * FROM mapcheck_memory WHERE mapcheck_memory.ids NOT IN (select gcid from ".TABLE_GEOCACHES.");");           
              $missing_gcids = array_map(array($this, "get_ids"),$missing_gcids);            
            }
            
            // clear the table
            $db->query("TRUNCATE mapcheck_memory;");   
                   
            // .. and to the same as above for the waypoints:
            if(!empty($_POST['wptIds'])){
              $values = implode(",", array_map(array($this, "add_braces"), $wptIds));                      
              $db->query("INSERT INTO `mapcheck_memory` VALUES ".$values.";");                     
              // and get all ids which are not in the ownwaypoints table
              $missing_waypoints = $db->fetch_array("SELECT * FROM mapcheck_memory WHERE mapcheck_memory.ids NOT IN (select wptcode from ".TABLE_OWNWAYPOINTS.");");           
              $missing_waypoints = array_map(array($this, "get_ids"),$missing_waypoints);
            }
            
            $result = array();
            $result['missing_gcIds'] =  $missing_gcids;
            $result['missing_wptIds'] =  $missing_waypoints;
         
            $response->code = Response::OK;
            $response->addHeader('Content-type', 'text/plain');
            $response->body = json_encode((object)$result);
        } else {
            $response->code = Response::BADREQUEST;
		}
		
        return $response;
        
    }
    
    function add_braces($n){
        return "('".$n."')";
    }
    
    function get_ids($n){
        return $n['ids'];
    }
   
}
