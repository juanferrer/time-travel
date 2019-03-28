<?php

header('Access-Control-Allow-Origin: https://vesta.uclan.ac.uk/~jeferrer-cortez');
// TODO: Remove next line
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

define('DB_HOST', 'localhost');
define('DB_USERNAME', 'jeferrer-cortez');
define('DB_PASSWORD', '20682852');
define('DB_NAME', 'jeferrer-cortez');

if (!isset($_POST['type'])) {
    // What is this? Not even trying to request anything
    die();
}

$requestType = $_POST['type'];

// Handle requests per type
switch (strtoupper($requestType)) {
    case 'GET_SCORES':
        getHighScores();
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

// Connect to DB, check and return connection
function connectToDB()
{
    // Connect to DB
    $mysqli = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Make sure no errors appeared during connection
    if ($mysqli->connect_error) {
        // Unable to connect to DB
        http_response_code(500);
        die('Unable to connect to database');
    }

    return $mysqli;
}

// Assume a connection with the DB is established and retrieve the
function retrieveHighScores($mysqli)
{
    $result = $mysqli->query('SELECT name, score FROM time_travel_high_scores');
    if (!$result) {
        // Wait, something didn't work
        die('Unable to retrieve high scores');
    }

    $highScores = $result->fetch_all(MYSQLI_ASSOC);
    $result->close();
    return $highScores;
}

// Get high scores from DB and send to client
function getHighScores()
{
    // Get DB connection
    $mysqli = connectToDB();

    $highScores = retrieveHighScores($mysqli);

    echo json_encode($highScores);
}

// Check whether the current score is higher that the lowest score in the
// table. If so, insert, re-sort and re-commit
function submitHighScore($name, $score)
{
    // Get DB connection
    $mysqli = connectToDB();

    $highScores = retrieveHighScores($mysqli);

    // Add new score to table
    array_push($highScores, ['name' => $name, 'score' => $score]);

    // Sort table by score
    usort($highScores, function ($a, $b) {
        // Interesting operator <=>
        // According to PHP docs (https://www.php.net/manual/en/language.operators.comparison.php):
        // The Spaceship operator returns an integer less than, equal to, or greater than zero
        // when $a is respectively less than, equal to, or greated than $b
        return $b['score'] <=> $a['score'];
    });

    // Commit top 10 to DB
    array_pop($highScores);
    $query = '';
    for ($i = 0; $i < sizeof($highScores); $i++) {
        $newName = $highScores[$i]['name'];
        $newScore = $highScores[$i]['score'];

        $result = $mysqli->query("UPDATE time_travel_high_scores SET name = '$newName', score = $newScore WHERE id = $i");

        if (!$result) {
            http_response_code(500);
            die('Something went wrong. I think I broke the DB');
        }
    }
    echo 'Successfully submitted high score';
}
