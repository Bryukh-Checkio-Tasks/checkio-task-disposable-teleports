from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.io import CheckiOReferee

from tests import TESTS

def convert_teleports(teleports_str):
    """str -> list of tuple(int, int)
    Convert string describing teleports at list of teleports.
    teleports_str - string describing teleports map
    return List of teleports
    """
    splitted_str = [tuple(t) for t in teleports_str.split(",")]
    return [tuple(sorted([int(x), int(y)])) for x, y in splitted_str]


def check_route(teleports_str, route):
    """(str, str) -> (boolean, str, str)
    Check route for given map of teleports and return sucess or not and right part of route
    teleports_str - string described teleports map
    route - string with number of stations
    Return tuple wtih Success or not and part or full route and message text
    """
    start = 1
    teleports_map = convert_teleports(teleports_str)
    if not route:
        return False, '', "Route not started"
    if route[0] != '1' or route[-1] != '1':
        return False, '', "Route must started and ended at 1"
    ch_route = route[0]
    for i in range(len(route) - 1):
        try:
            step = tuple(sorted([int(route[i]), int(route[i + 1])]))
        except ValueError:
            return False, ch_route, "Route must contain only digits"
        if not step in teleports_map:
            return False, ch_route, "No way from {0} to {1}".format(route[i], route[i + 1])
        teleports_map.remove(step)
        ch_route += route[i + 1]
    for s in range(1, 9):
        if not str(s) in ch_route:
            return False, ch_route, "You forget about {0}".format(s)
    return True, ch_route, "Success"


def checker(answer, user_result):
    result = check_route(answer, user_result)
    return result[0], (result[1], result[2])


api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests=TESTS,
        checker=checker).on_ready)
