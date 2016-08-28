from os.path import isfile, join
from os import listdir
from bs4 import BeautifulSoup
import re
path = "/Users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses"
sem = "spring_2017"
extension = "html"
sem_directory = "data"
destination = "data/spring_2017.json"
raw_template = re.compile(r"([\w_ ]+)_raw.txt")
option_template = re.compile(r"<option value=\"([0-9a-zA-Z,_: ]+)\"\s+\w*.*")
display_template = re.compile(r"displayCourse\((?P<mine>[^\)]+)\)")
strip_quotes = re.compile(r"(?<![\'a-zA-Z])\'(?![\'a-zA-Z])")
replaceQuotes = re.compile(r"\'([a-zA-Z0-9]*)\'?");

onlyFiles = [f for f in listdir(path) if (isfile(join(path, f)) and raw_template.match(f))]

def getFiles(files):
    fileContents = []
    for i in files:
        thisFile = open(i, 'r')
        txt = BeautifulSoup(open(i, 'r'), 'html.parser')
        print(txt.prettify())
        options = txt.find_all("option", value=re.compile(r"[\w,_: ]+"))
        options = [tag["value"] for tag in options]
        fileContents.append(options)
        # lines = txt.split("\n")
        # print(lines[0])
        # lines = [option_template.sub(l, r"\1") for l in lines]
        # fileContents.append(lines)
    return fileContents


def printArray(arry):
    for i in range(len(arry)):
        print(arry[i])

# myArray = getFiles(onlyFiles)
# printArray(myArray)

def parseCourses():
    semester = open('{0}/{1}.{2}'.format(sem_directory, sem, extension), 'r')
    soup = BeautifulSoup(semester, 'html.parser')
    courses = soup.find_all("div", class_="courseitem")
    courseCodes = soup.find_all("div", class_="coursecode")
    courseCodes = [list(tag.stripped_strings)[0] for tag in courseCodes]
    courses = [tag.a["onclick"] for tag in courses]
    courses = [display_template.sub(r"\g<mine>", s) for s in courses]
    courses = [strip_quotes.sub(r"", s) for s in courses]
    courses = [replaceQuotes.sub("\"" + r"\1" + "\"", s) for s in courses]
    for i in range(len(courses)):
        print(courses[i], courseCodes[i] + "\n", sep=",")
    print(len(courses))
    saver = open(destination, "w")
    saver.write("{\n\t\"courses\":\n\t[")

    for i in range(len(courses)):
        soup = courses[i]
        soup1 = courseCodes[i]
        comma = "," if i < len(courses) - 1 else ""
        saver.write("\t\t[{0}, \"{1}\"]{2}\n".format(soup, soup1, comma))
    saver.write("\t]\n}")
    saver.flush()
    saver.close()
parseCourses()
