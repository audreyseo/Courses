from os.path import isfile, join
from os import listdir
from bs4 import BeautifulSoup
import re
path = "/Users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses"
raw_template = re.compile(r"([\w_ ]+)_raw.txt")
option_template = re.compile(r"<option value=\"([0-9a-zA-Z,_: ]+)\"\s+\w*.*")
display_template = re.compile(r"displayCourse\((?P<mine>[^\)]+)\)")
strip_quotes = re.compile(r"(?<![\'a-zA-Z])\'(?![\'a-zA-Z])")

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
    fall = open('fall_2016.txt', 'r')
    fall_soup = BeautifulSoup(fall, 'html.parser')
    courses = fall_soup.find_all("div", class_="courseitem")
    courses = [tag.a["onclick"] for tag in courses]
    courses = [display_template.sub(r"\g<mine>", s) for s in courses]
    courses = [strip_quotes.sub(r"", s) for s in courses]
    for soup in courses:
        print(soup, "", sep="\n")
    print(len(courses))
    saver = open("parsed_text.json", "a")
    saver.write("{\n\tcourses:\n\t[")
    for i in range(len(courses)):
        soup = courses[i]
        comma = "," if i < len(courses) - 1 else ""
        saver.write("\t\t[{0}]{1}\n".format(soup, comma))
    saver.write("\t]\n}")
    saver.flush()
    saver.close()
parseCourses()
