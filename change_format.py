from collections import defaultdict


def change_format(filename):
    data = defaultdict(lambda: defaultdict(list))
    date_list = []
    with open(filename, "r") as f_read:
        f_read.readline()
        date, country, infections, recovered, deaths = f_read.readline().strip().split(',')
        while date:
            if country == "China":
                date_list.append(date)
            data[date]["Infections"].append(infections)
            data[date]["Recovered"].append(recovered)
            data[date]["Deaths"].append(deaths)
            date, country, infections, recovered, deaths = f_read.readline().strip().split(',')

    with open("Corona_NewFormat.csv", "w") as f_write:
        f_write.write("Date,Conditions,China,Italy,Iran,South Korea,France,Spain,Germany,United States,Total\n")
        for date in date_list:
            f_write.write("%s,Infections," % date)
            for i, num in enumerate(data[date]["Infections"]):
                if i != len(data[date]["Infections"]) - 1:
                    f_write.write("%s," % num)
                else:
                    f_write.write("%s\n" % num)

            f_write.write("%s,Recovered," % date)
            for i, num in enumerate(data[date]["Recovered"]):
                if i != len(data[date]["Recovered"]) - 1:
                    f_write.write("%s," % num)
                else:
                    f_write.write("%s\n" % num)

            f_write.write("%s,Deaths," % date)
            for i, num in enumerate(data[date]["Deaths"]):
                if i != len(data[date]["Deaths"]) - 1:
                    f_write.write("%s," % num)
                else:
                    f_write.write("%s\n" % num)


if __name__ == '__main__':
    change_format("Corona_March19th.csv")