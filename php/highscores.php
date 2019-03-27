<?php

header('Access-Control-Allow-Origin: https://vesta.uclan.ac.uk/~jeferrer-cortez');
// TODO: Remove next line
header('Access-Control-Allow-Origin: *');

define('DB_USERNAME', 'jeferrer-cortez');
define('DB_PASSWORD', '20682852');
define('DB_NAME', 'time_travel_high_scores');

if (!isset($_POST['type'])) {
    // What is this? Not even trying to request anything
    die();
}

$requestType = $_POST['type'];

// Handle requests per type
switch (strtoupper($requestType)) {
    case 'GET_SCORES':
        sendHighScores();
        break;
    case 'SUBMIT_SCORE':
        $name = $_POST['name'];
        $score = $_POST['score'];
        submitHighScore($name, $score);
        break;
    default:
        http_response_code(400);
        die('Unable to process request');
        break;
}

// Get high from DB and send to client
function sendHighScores()
{
    // Connect to DB
    $mysqli = new mysqli('localhost', DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Make sure no errors appeared during connection
    if ($mysqli->connect_error) {
        // Unable to connect to DB
        http_response_code(500);
        die('Unable to connect to database');
    }

    $result = $mysqli->query("SELECT ('name', 'score') FROM 'time-travel-high-scores'");
    if ($result > 0) {
        // Wait, something didn't work
        $result->close();
        die('Something went wrong');
    }
    echo $result->fetch_assoc();
}

function submitHighScore($name, $score)
{
    http_response_code(501);
    die("Not implemented");
}

?>