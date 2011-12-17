<?php


/**
 * @namespace GCTour\Admin
 * @uri /admin
 */
class AdminResource extends Resource {
    
    protected $tm;
    
    function __construct() {
        
        $this->tm = TemplateManager::getInstance();
        
    }
    
    function get($request) {
        // admin Only
        Utilities::isAdmin();
        
        
        $response = new Response($request);
        
        $this->tm->smarty->assign('title', 'Admin');
        
        
        
        $body = $this->tm->render('admin');
              
        $response->code = Response::OK;
        $response->addHeader('Content-type', 'text/html');
        $response->body = $body;
    
        return $response;
        
   }
}

/**
 * @namespace GCTour\Admin\Infos
 * @uri /admin/info
 */
class AdminInfoResource extends Resource {
    
  protected $tm;
  
  function __construct() {
    $this->tm = TemplateManager::getInstance();  
  }
  
  function get($request) {
    // admin Only
    Utilities::isAdmin();    
    
    $response = new Response($request);
    
    $this->tm->smarty->assign('title', 'Admin Infos');
    
    
    
    
    
    
    $body = $this->tm->render('admin');
    
    $response->code = Response::OK;
    $response->addHeader('Content-type', 'text/html');
    $response->body = $body;
    
    return $response;
    
  }
    
}

/**
 * @namespace GCTour\Admin\Infos\Tours
 * @uri /admin/info/tours
 * @uri /admin/info/tours/page/{page}
 */
class AdminInfoTourResource extends Resource {
    
  protected $tm;
  private $page = 1;
 
  function __construct($parameter) {
    
    $this->tm = TemplateManager::getInstance();
    
    if(isset($parameter['page']) && is_numeric($parameter['page'])) {
      $this->page = $parameter['page'];    
    }
  }
  
  function get($request) {
    // admin Only
    Utilities::isAdmin();    
 
    $db = Database::obtain();    
    $response = new Response($request);
        
    $this->tm->smarty->assign('title', 'Admin Infos Tours');
    
  $this->tm->smarty->assign('page', $this->page);
    
    $no_tours = $db->query_first("SELECT count(*) AS no FROM ".TABLE_TOURS);
    
        
    
    $body = $this->tm->render('admin_info_tour');
    
    $response->code = Response::OK;
    $response->addHeader('Content-type', 'text/html');
    $response->body = $body;
    
    return $response;
    
  }
    
}



/**
 * Display and process a HTML form via a HTTP POST request
 *
 * This example outputs a simple HTML form and gathers the POSTed data
 *
 * @namespace Tonic\Examples\HTMLForm
 * @uri /htmlform
 */
class HTMLForm extends Resource {
    
    /**
     * Handle a GET request for this resource
     * @param Request request
     * @return Response
     */
    function get($request, $name) {
        
        $response = new Response($request);
        
        if ($name) {
            $welcome = "<p>Hello $name.</p>".
                "<p>Raw POST data:</p>".
                "<blockquote>$request->data</blockquote>";
        } else {
            $welcome = "<p>Enter your name.</p>";
        }
        
        $response->addHeader('Content-type', 'text/html');
        $response->body = <<<EOF
<!DOCTYPE html>
<html>
    <body>
        <form action="htmlform" method="post">
            <label>Name: <input type="text" name="name"></label>
            <input type="submit">
        </form>
        $welcome
    </body>
</html>
EOF;
        
        return $response;
        
    }
    
    /**
     * Handle a POST request for this resource
     * @param Request request
     * @return Response
     */
    function post($request) {
        
        if (isset($_POST['name'])) {
            $name = htmlspecialchars($_POST['name']);
        } else {
            $name = '';
        }
        
        return $this->get($request, $name);
        
    }
    
}


