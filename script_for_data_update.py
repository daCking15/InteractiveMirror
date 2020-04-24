"""
Data collector

By Yifei Diao 04/22/2020

"""
from collections import defaultdict


def get_data_from_jhu(filename, data, countries):
    classification = ""
    if "confirmed" in filename:
        classification = "Infections"
    elif "deaths" in filename:
        classification = "Deaths"
    elif "recovered" in filename:
        classification = "Recovered"

    with open(filename, "r") as f:
        f.readline()
        state, country, lat, lon, *dates = f.readline().strip().split(',')
        while country:
            month, day = 1, 21
            for i in range(len(dates)):
                day += 1
                date, month, day = generate_date(month, day)

                data[date]["Total"][classification] += int(dates[i])
                if country in countries:
                    data[date][country][classification] += int(dates[i])

            raw_line = f.readline().replace("\"", "")
            line = raw_line.strip().split(',')
            if line[0] != "Bonaire":
                if len(line) > 1:
                    if line[1] == "Korea":
                        state, c1, c2, lat, lon, *dates = line
                        c2 = c2.replace(" ", "")
                        country = c2 + " " + c1
                    else:
                        state, country, lat, lon, *dates = line
                        if country == "US":
                            country = "United States"
                else:
                    country = None
            else:
                state1, state2, country, lat, lon, *dates = line

    return data


def get_data_from_oxford(filename, data, countries):
    month_mapping = {
        "Jan": "01",
        "Feb": "02",
        "Mar": "03",
        "Apr": "04",
        "May": "05",
        "Jun": "06",
        "Jul": "07",
        "Aug": "08",
        "Sep": "09",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12"
    }
    classification = "Tests"

    with open(filename, "r") as f:
        f.readline()
        raw_line = f.readline().replace("\"", "")
        country, code, md, year, tests = raw_line.strip().split(',')
        while country:
            month, day = md.split(" ")
            year = year.replace(" ", "")
            date = year + "-" + month_mapping[month] + "-" + "0" + day if int(day) < 10 else \
                year + "-" + month_mapping[month] + "-" + day

            data[date]["Total"][classification] += int(tests)
            if country in countries:
                data[date][country][classification] += int(tests)

            raw_line = f.readline().replace("\"", "")
            line = raw_line.strip().split(',')
            while len(line) == 6:
                raw_line = f.readline().replace("\"", "")
                line = raw_line.strip().split(',')
            if len(line) > 1:
                country, code, md, year, tests = line
            else:
                country = None

    return data


def generate_date(month, day):
    if (month in [1, 3, 5, 7, 8, 10, 12] and day > 31) or \
            (month in [4, 6, 8, 11] and day > 30) or \
            (month == 2 and day > 29):
        month += 1
        day = 1

    if month < 10:
        date = "2020-0" + str(month)
        if day < 10:
            date += "-0" + str(day)
        else:
            date += "-" + str(day)
    else:
        date = "2020-" + str(month)
        if day < 10:
            date += "-0" + str(day)
        else:
            date += "-" + str(day)
    return date, month, day


def check_data(data, countries):
    month, day = 1, 22
    for i in range(len(data.keys()) - 1):
        prev_date, _, _ = generate_date(month, day)
        day += 1
        date, month, day = generate_date(month, day)
        for country in countries:
            for classification in ["Infections", "Deaths", "Recovered", "Tests"]:
                if data[date][country][classification] < data[prev_date][country][classification]:
                    data[date][country][classification] = data[prev_date][country][classification]
    return data


def create_csv(filename, data):
    with open(filename, "w") as f:
        f.write("Date,Country,Infections,Recovered,Deaths,Tests\n")
        for date, v1 in data.items():
            for country, v2 in v1.items():
                f.write("%s," % date)
                f.write("%s," % country)
                f.write("%s," % v2["Infections"])
                f.write("%s," % v2["Recovered"])
                f.write("%s," % v2["Deaths"])
                f.write("%s\n" % v2["Tests"]) if "Tests" in v2 else f.write("0\n")


if __name__ == '__main__':
    all_data = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

    countries_regions = [
        "China",
        "Italy",
        "Iran",
        "South Korea",
        "France",
        "Spain",
        "Germany",
        "United States",
        "Switzerland",
        "United Kingdom",
        "Netherlands",
        "Turkey",
        "Total"
    ]

    all_data = get_data_from_jhu("time_series_covid19_confirmed_global.csv", all_data, countries_regions)
    all_data = get_data_from_jhu("time_series_covid19_deaths_global.csv", all_data, countries_regions)
    all_data = get_data_from_jhu("time_series_covid19_recovered_global.csv", all_data, countries_regions)
    all_data = get_data_from_oxford("full-list-total-tests-for-covid-19.csv", all_data, countries_regions)
    all_data = check_data(all_data, countries_regions)

    create_csv("newestCSV.csv", all_data)
