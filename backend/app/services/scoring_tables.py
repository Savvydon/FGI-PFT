from typing import Dict

SCORING: Dict = {
    "male": {
        "<29": {
             "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                "type": "Cage-based"
            },
            "step_up_3min": {
                "ranges": [(0.0, 82.999, 10), (83.0, 96.0, 9), (96.1, 107.0, 8),
                           (107.1, 117.0, 7), (117.1, 130.0, 6), (130.1, float('inf'), 1)],
                "ideal": 105,
                "optimum": 115,
                "type": "Lower is better"
            },
            "push_up_1min": {
                "ranges": [(50.0, float('inf'), 10), (40.0, 49.0, 8), (30.0, 39.0, 6),
                           (20.0, 29.0, 4), (10.0, 19.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 50,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(40.0, float('inf'), 10), (35.0, 39.0, 8), (30.0, 34.0, 6),
                           (20.0, 29.0, 4), (10.0, 19.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 40,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(10.0, float('inf'), 5), (8.0, 9.0, 4), (5.0, 7.0, 3),
                           (3.0, 4.0, 2), (1.0, 2.0, 1), (0.0, 0.0, 0)],
                "ideal": 10,
                "type": "Higher is better"
            },
            "sit_reach_cm": {
                "ranges": [(61.0, 70.0, 5), (51.0, 60.0, 4), (41.0, 50.0, 3),
                           (31.0, 40.0, 2), (21.0, 30.0, 1), (0.0, 20.0, 0)],
                "ideal": 65.0,
                "type": "Higher is better"
            },
            "bmi": {
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        },
        "30-39": {
              "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                #"type": "2.4 km Jog"
                "type": "Cage-based"
            },
            "step_up_3min": {  # same as <29
                "ranges": [(0.0, 82.999, 10), (83.0, 96.0, 9), (96.1, 107.0, 8),
                           (107.1, 117.0, 7), (117.1, 130.0, 6), (130.1, float('inf'), 1)],
                "ideal": 115,
                "optimum": 125,
                "type": "Lower is better"
            },
            "push_up_1min": {  # same as <29
                "ranges": [(50.0, float('inf'), 10), (40.0, 49.0, 8), (30.0, 39.0, 6),
                           (20.0, 29.0, 4), (10.0, 19.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 50,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(36.0, float('inf'), 10), (30.0, 35.0, 8), (20.0, 29.0, 6),
                           (10.0, 19.0, 4), (6.0, 9.0, 2), (4.0, 5.0, 1), (0.0, 3.0, 0)],
                "ideal": 36,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(9.0, float('inf'), 5), (8.0, 8.0, 4), (7.0, 7.0, 3),
                           (5.0, 6.0, 2), (1.0, 3.0, 1), (0.0, 0.0, 0)],
                "ideal": 9,
                "type": "Higher is better"
            },
            "sit_reach_cm": {  # same
                "ranges": [(61.0, 70.0, 5), (51.0, 60.0, 4), (41.0, 50.0, 3),
                           (31.0, 40.0, 2), (21.0, 30.0, 1), (0.0, 20.0, 0)],
                "ideal": 65.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        },
        "40-49": {
              "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                #"type": "5 km Walk"
                "type": "Cage-based"
            },
            "step_up_3min": {  # same
                "ranges": [(0.0, 82.999, 10), (83.0, 96.0, 9), (96.1, 107.0, 8),
                           (107.1, 117.0, 7), (117.1, 130.0, 6), (130.1, float('inf'), 1)],
                "ideal": 130,
                "optimum": 140,
                "type": "Lower is better"
            },
            "push_up_1min": {
                "ranges": [(45.0, float('inf'), 10), (40.0, 44.0, 8), (30.0, 39.0, 6),
                           (20.0, 29.0, 4), (10.0, 19.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 45,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(34.0, float('inf'), 10), (30.0, 33.0, 8), (25.0, 29.0, 6),
                           (20.0, 24.0, 4), (10.0, 19.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 34,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(8.0, float('inf'), 5), (7.0, 7.0, 4), (6.0, 6.0, 3),
                           (5.0, 5.0, 2), (1.0, 4.0, 1), (0.0, 0.0, 0)],
                "ideal": 8,
                "type": "Higher is better"
            },
            "sit_reach_cm": {  # same
                "ranges": [(61.0, 70.0, 5), (51.0, 60.0, 4), (41.0, 50.0, 3),
                           (31.0, 40.0, 2), (21.0, 30.0, 1), (0.0, 20.0, 0)],
                "ideal": 65.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        },
        "50-59": {
            "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                #"type": "5 km Walk"
                "type": "Cage-based"
            },
            "step_up_3min": {  # same
                "ranges": [(0.0, 82.999, 10), (83.0, 96.0, 9), (97.0, 107.0, 8),
                           (108.0, 117.0, 7), (118.0, 130.0, 6), (130.001, float('inf'), 1)],
                "ideal": 135,
                "optimum": 145,
                "type": "Lower is better"
            },
            "push_up_1min": {
                "ranges": [(40.0, float('inf'), 10), (21.0, 39.0, 8), (11.0, 20.0, 6),
                           (6.0, 10.0, 4), (3.0, 5.0, 2), (1.0, 2.0, 1), (0.0, 0.0, 0)],
                "ideal": 40,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(30.0, float('inf'), 10), (20.0, 29.0, 8), (14.0, 19.0, 6),
                           (10.0, 13.0, 4), (5.0, 9.0, 2), (1.0, 4.0, 1), (0.0, 0.0, 0)],
                "ideal": 30,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(7.0, float('inf'), 5), (6.0, 6.0, 4), (5.0, 5.0, 3),
                           (4.0, 4.0, 2), (1.0, 3.0, 1), (0.0, 0.0, 0)],
                "ideal": 7,
                "type": "Higher is better"
            },
            "sit_reach_cm": {  # same
                "ranges": [(61.0, 70.0, 5), (51.0, 60.0, 4), (41.0, 50.0, 3),
                           (31.0, 40.0, 2), (21.0, 30.0, 1), (0.0, 20.0, 0)],
                "ideal": 65.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        },
        "60+": {
            "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                "type": "Cage-based"
                #"type": "5 km Walk"
            },
            "step_up_3min": {  # same
                "ranges": [(0.0, 82.999, 10), (83.0, 96.0, 9), (97.0, 107.0, 8),
                           (108.0, 117.0, 7), (118.0, 130.0, 6), (130.001, float('inf'), 1)],
                "ideal": 140,
                "optimum": 140,
                "type": "Lower is better"
            },
            "push_up_1min": {
                "ranges": [(39.0, float('inf'), 10), (30.0, 38.0, 8), (20.0, 28.0, 6),
                           (10.0, 19.0, 4), (5.0, 9.0, 2), (1.0, 4.0, 1), (0.0, 0.0, 0)],
                "ideal": 39,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(25.0, float('inf'), 10), (15.0, 24.0, 8), (10.0, 14.0, 6),
                           (6.0, 9.0, 4), (3.0, 5.0, 2), (1.0, 2.0, 1), (0.0, 0.0, 0)],
                "ideal": 25,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(6.0, float('inf'), 5), (5.0, 5.0, 4), (4.0, 4.0, 3),
                           (3.0, 3.0, 2), (2.0, 2.0, 1), (0.0, 1.0, 0)],
                "ideal": 6,
                "type": "Higher is better"
            },
            "sit_reach_cm": {  # same
                "ranges": [(61.0, 70.0, 5), (51.0, 60.0, 4), (41.0, 50.0, 3),
                           (31.0, 40.0, 2), (21.0, 30.0, 1), (0.0, 20.0, 0)],
                "ideal": 65.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        }
    },
    "female": {
        "<29": {
            "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                "type": "Cage-based"
                #"type": "2.4 km Jog"
            },
            "step_up_3min": {
                "ranges": [(0.0, 90.0, 10), (90.1, 110.0, 9), (111.0, 118.0, 8),
                           (119.0, 128.0, 7), (129.0, 140.0, 6), (140.001, float('inf'), 1)],
                "ideal": 120,
                "optimum": 130,
                "type": "Lower is better"
            },
            "push_up_1min": {  # same as male <29
                "ranges": [(50.0, float('inf'), 10), (40.0, 49.0, 8), (30.0, 39.0, 6),
                           (20.0, 29.0, 4), (10.0, 19.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 50,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(40.0, float('inf'), 10), (30.0, 39.0, 8), (20.0, 29.0, 6),
                           (10.0, 19.0, 4), (5.0, 9.0, 2), (1.0, 4.0, 1), (0.0, 0.0, 0)],
                "ideal": 40,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(6.0, float('inf'), 5), (5.0, 5.0, 4), (4.0, 4.0, 3),
                           (3.0, 3.0, 2), (2.0, 2.0, 1), (0.0, 1.0, 0)],
                "ideal": 6,
                "type": "Higher is better"
            },
            "sit_reach_cm": {
                "ranges": [(51.0, 60.0, 5), (41.0, 50.0, 4), (31.0, 40.0, 3),
                           (21.0, 30.0, 2), (11.0, 20.0, 1), (0.0, 10.0, 0)],
                "ideal": 55.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        },
        "30-39": {
            "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                "type": "Cage-based"
                #"type": "2.4 km Jog"
            },
            "step_up_3min": {  # same as <29 female
                "ranges": [(0.0, 89.999, 10), (90.0, 110.0, 9), (111.0, 118.0, 8),
                           (119.0, 128.0, 7), (129.0, 140.0, 6), (140.001, float('inf'), 1)],
                "ideal": 120,
                "optimum": 130,
                "type": "Lower is better"
            },
            "push_up_1min": {
                "ranges": [(40.0, float('inf'), 10), (30.0, 39.0, 8), (20.0, 29.0, 6),
                           (15.0, 19.0, 4), (10.0, 14.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 40,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(36.0, float('inf'), 10), (30.0, 35.0, 8), (20.0, 29.0, 6),
                           (15.0, 19.0, 4), (10.0, 14.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 36,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(6.0, float('inf'), 5), (5.0, 5.0, 4), (4.0, 4.0, 3),
                           (3.0, 3.0, 2), (2.0, 2.0, 1), (0.0, 1.0, 0)],
                "ideal": 6,
                "type": "Higher is better"
            },
            "sit_reach_cm": {  # same as <29 female
                "ranges": [(51.0, 60.0, 5), (41.0, 50.0, 4), (31.0, 40.0, 3),
                           (21.0, 30.0, 2), (11.0, 20.0, 1), (0.0, 10.0, 0)],
                "ideal": 55.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        },
        "40-49": {
            "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                "type": "Cage-based"
                #"type": "5 km Walk"
            },
            "step_up_3min": {  # same
                "ranges": [(0.0, 89.999, 10), (90.0, 110.0, 9), (111.0, 118.0, 8),
                           (119.0, 128.0, 7), (129.0, 140.0, 6), (140.001, float('inf'), 1)],
                "ideal": 130,
                "optimum": 150,
                "type": "Lower is better"
            },
            "push_up_1min": {
                "ranges": [(35.0, float('inf'), 10), (25.0, 34.0, 8), (20.0, 24.0, 6),
                           (15.0, 19.0, 4), (11.0, 14.0, 2), (5.0, 9.0, 1), (0.0, 4.0, 0)],
                "ideal": 35,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(34.0, float('inf'), 10), (30.0, 33.0, 8), (20.0, 29.0, 6),
                           (15.0, 19.0, 4), (9.0, 14.0, 2), (4.0, 8.0, 1), (0.0, 3.0, 0)],
                "ideal": 34,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(5.0, float('inf'), 5), (4.0, 4.0, 4), (3.0, 3.0, 3),
                           (2.0, 2.0, 2), (1.0, 1.0, 1), (0.0, 0.0, 0)],
                "ideal": 5,
                "type": "Higher is better"
            },
            "sit_reach_cm": {
                "ranges": [(51.0, 60.0, 5), (41.0, 50.0, 4), (21.0, 40.0, 3),
                           (21.0, 30.0, 2), (11.0, 20.0, 1), (0.0, 10.0, 0)],
                "ideal": 55.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        },
        "50-59": {
           "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                "type": "Cage-based"
                #"type": "5 km Walk"
            },
            "step_up_3min": {  # same
                "ranges": [(0.0, 89.999, 10), (90.0, 110.0, 9), (111.0, 118.0, 8),
                           (119.0, 128.0, 7), (129.0, 140.0, 6), (140.001, float('inf'), 1)],
                "ideal": 140,
                "optimum": 150,
                "type": "Lower is better"
            },
            "push_up_1min": {
                "ranges": [(30.0, float('inf'), 10), (21.0, 29.0, 8), (15.0, 20.0, 6),
                           (10.0, 14.0, 4), (5.0, 9.0, 2), (1.0, 4.0, 1), (0.0, 0.0, 0)],
                "ideal": 30,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(32.0, float('inf'), 10), (22.0, 31.0, 8), (16.0, 21.0, 6),
                           (9.0, 15.0, 4), (5.0, 8.0, 2), (1.0, 4.0, 1), (0.0, 0.0, 0)],
                "ideal": 32,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(5.0, float('inf'), 5), (4.0, 4.0, 4), (3.0, 3.0, 3),
                           (2.0, 2.0, 2), (1.0, 1.0, 1), (0.0, 0.0, 0)],
                "ideal": 5,
                "type": "Higher is better"
            },
            "sit_reach_cm": {  # same as 40-49 female
                "ranges": [(51.0, 60.0, 5), (41.0, 50.0, 4), (21.0, 40.0, 3),
                           (21.0, 30.0, 2), (11.0, 20.0, 1), (0.0, 10.0, 0)],
                "ideal": 55.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        },
        "60+": {
            "cardio": {
                "ranges": [
                    (1, 1, 40),  # Cage 1
                    (2, 2, 20),  # Cage 2
                    (3, 3, 5),   # Cage 3
                ],
                "ideal": 1,
                "type": "Cage-based"
                #"type": "5 km Walk"
            },
            "step_up_3min": {  # same
                "ranges": [(0.0, 89.999, 10), (90.0, 110.0, 9), (111.0, 118.0, 8),
                           (119.0, 128.0, 7), (129.0, 140.0, 6), (140.001, float('inf'), 1)],
                "ideal": 140,
                "optimum": 150,
                "type": "Lower is better"
            },
            "push_up_1min": {
                "ranges": [(28.0, float('inf'), 10), (17.0, 27.0, 8), (9.0, 16.0, 6),
                           (4.0, 8.0, 4), (2.0, 3.0, 2), (1.0, 1.0, 1), (0.0, 0.0, 0)],
                "ideal": 28,
                "type": "Higher is better"
            },
            "sit_up_1min": {
                "ranges": [(30.0, float('inf'), 10), (20.0, 29.0, 8), (15.0, 19.0, 6),
                           (10.0, 14.0, 4), (5.0, 9.0, 2), (1.0, 4.0, 1), (0.0, 0.0, 0)],
                "ideal": 30,
                "type": "Higher is better"
            },
            "chin_up_1min": {
                "ranges": [(5.0, float('inf'), 5), (4.0, 4.0, 4), (3.0, 3.0, 3),
                           (2.0, 2.0, 2), (1.0, 1.0, 1), (0.0, 0.0, 0)],
                "ideal": 5,
                "type": "Higher is better"
            },
            "sit_reach_cm": {  # same as 50-59 female
                "ranges": [(51.0, 60.0, 5), (41.0, 50.0, 4), (21.0, 40.0, 3),
                           (21.0, 30.0, 2), (11.0, 20.0, 1), (0.0, 10.0, 0)],
                "ideal": 55.0,
                "type": "Higher is better"
            },
            "bmi": {  # same
                "ranges": [(18.0, 24.9, 20), (25.0, 29.9, 15), (30.0, 39.9, 10),
                           (0.0, 17.9, 10), (40.0, 49.9, 5), (50.0, float('inf'), 2)],
                "ideal": (18.0, 24.9),
                "type": "Closer to ideal"
            }
        }
    }
}