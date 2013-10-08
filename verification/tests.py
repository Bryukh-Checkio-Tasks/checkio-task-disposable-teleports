import random

TESTS = {
    "Basics": [
        {
            "input": "12,23,34,45,56,67,78,81",
            "answer": "12,23,34,45,56,67,78,81"
        },
        {
            "input": "12,28,87,71,13,14,34,35,45,46,63,65",
            "answer": "12,28,87,71,13,14,34,35,45,46,63,65"
        },
        {
            "input": "12,15,16,23,24,28,83,85,86,87,71,74,56",
            "answer": "12,15,16,23,24,28,83,85,86,87,71,74,56"
        },
        {
            "input": "13,14,23,25,34,35,47,56,58,76,68",
            "answer": "13,14,23,25,34,35,47,56,58,76,68"
        },
        {
            "input": "12,13,14,15,16,17,18,82,83,84,85,86,87",
            "answer": "12,13,14,15,16,17,18,82,83,84,85,86,87"
        },
        {
            "input": "12,17,87,86,85,82,65,43,35,46",
            "answer": "12,17,87,86,85,82,65,43,35,46"
        },
        {
            "input": "13,14,34,32,35,52,37,38,78,16,26",
            "answer": "13,14,34,32,35,52,37,38,78,16,26"
        },
        {
            "input": "12,23,36,68,85,57,74,41,38,62,25",
            "answer": "12,23,36,68,85,57,74,41,38,62,25"
        },
        {
            "input": "13,37,78,82,26,64,45,51,75,27,34,36,25,35,17,48,47",
            "answer": "13,37,78,82,26,64,45,51,75,27,34,36,25,35,17,48,47"
        },
        {
            "input": "18,84,47,76,62,23,35,51,87,65,38,41,75",
            "answer": "18,84,47,76,62,23,35,51,87,65,38,41,75"
        },
        {
            "input": "18,84,43,36,62,25,57,71,16,56,85",
            "answer": "18,84,43,36,62,25,57,71,16,56,85"
        },
        {
            "input": "16,64,45,53,38,87,72,21,74,52,15,73",
            "answer": "16,64,45,53,38,87,72,21,74,52,15,73"
        }


    ],
    "Extra": [

    ]
}


def generateMap(N):
    """int -> str
    return random route from 1 to 1 through all N points
    Constrains: N > 1
    Return: String contain route.
    """
    route = "1"
    stations = [str(i) for i in range(2, N + 1)]
    for _ in range(N - 1):
        route += stations.pop(random.randrange(0, len(stations)))
    route += "1"
    teleports = [str(route[i]) + str(route[i + 1]) for i in range(len(route) - 1)]
    for _ in range(9):
        rand_teleport = str(random.randrange(1, N + 1)) + str(random.randrange(1, N + 1))
        if (rand_teleport[0] != rand_teleport[1] and
                    rand_teleport not in teleports and rand_teleport[::-1] not in teleports):
            teleports.append(rand_teleport)
    return ','.join(teleports)

for _ in range(4):
    r = generateMap(8)
    TESTS["Extra"].append({"input": r, "answer": r})