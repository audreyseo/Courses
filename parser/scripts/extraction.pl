#!/usr/bin/perl
use String::Util ':all';
use POSIX;

sub getContents{
  my ($name, @list);
  $name = shift(@_);
  if ($name =~ m/\w+\.\w+/ && length($name) < 100) {
    open(DATA, "<$name") or die "Couldn't open file $name for reading, $!";
    @list = <DATA>;
    close(DATA);
    foreach (@list) {
      $_ =~ s/^(.*)\s{1,}$/\1/; # Trims trailing whitespace at the end
      $_ =~ s/\t/  /g; # Translates tabs to spaces for more compact formatting
    }
    return @list;
  } else {
    return ($name, @_);
  }

}

sub println{
  my ($joined) = join("\n\n", @_);
  print "\n\n$joined\n\n";
}

sub printCompact{
  my ($joined) = join("\n", @_);
  print "\n$joined\n";
}

sub cleanit{
  my ($len, $item, @items, $result);
  $len =scalar(@_);
  if ($len == 1) {
    $item = shift(@_);
    $item =~ s/[\s]{2,}//gs;
    return $item;
  } else {
    @items =();
    foreach (@_) {
      $_ =~ s/\s{2,}//gs;
      $result =$_;
      push(@items, $result);
    }
    return @items;
  }
}

sub keyit{
  my ($key, $len, $item, $string, @items);
  # Takes in a name and a scalar/array and formats it for JSON
  # i.e. (key, (list, of, things)) => "key: ["list", "of", "things"]"
  $key =shift(@_);
  $len =scalar(@_);
  if ($len == 1 && !($key =~ m/(day|time)/) && !($item =~ m/[<>]/)) {
    $item =shift(@_);
    $string ="$item";
    if ($string =~ m/^\d+$/) {
      # If it's only digits, then don't put it in quotation marks.
      return "$key: $item";
    }
    return "$key: \"$item\"";
  } elsif ($item =~ m/[<>]/){
    @items = @_;
    return "$key: [\"".join("\", \"", @items)."\"]"
  } else {
    return "None.";
  }
}

# Function: jsonify turns a list of one name and 1-n "key: value"s into a single JSON object that has one key, the $name specified.
sub jsonify{
  my ($name, $t, $joined, $json, $dir);
  # First argument = name of the JSON object.
  $name = shift(@_);
  # Specify a custom tab of 2 spaces.
  $t = "  ";
  # First join all of the keys/values.
  $joined = "\n$t\{\n$t$t" . join(",\n$t$t", @_) . "\n$t\}";
  # Now join it to the name with all of the proper brackets.
  $json =  "\n{\n$t$name:$joined\n}\n\n";
  # Print to a file with the same name as the course registration number.
  $dir = "/Users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses/parser/json_classes/";
  open(DATA, ">$dir$name.json") or die "Couldn't open file $dir$name.json for writing, $!";
  print "\n\nWritten to file $name.json:\n";
  print $json;
  print DATA $json;
  close(DATA);
}

sub csvify{
  my ($s, $keysRef, $dir);
  $s = ";";
  $keysRef = $_[0];
  my (%keys) = %$keysRef;
  my @csv = ("regNum", "classCode", "professor", "fullTitle", "dept", "dNum", "titleString", "day", "time1", "time2", "location", "building", "room", "credit", "enrollment", "available", "fyReservedSeats", "max", "distributions", "distCode", "distDescription", "prerequisites", "description", "waitlistType", "firstComeFirstServe", "waitlistNotes");
  my @arrays = ("day", "time1", "time2", "distributions", "distCode", "distDescription");
  my $destination = "/users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses/parser/csv/fixed_maybe2.csv";
  open(DATA, "<$destination") or die "Could not open file $destination for reading, $!";
  my @list = <DATA>;
  close(DATA);
  open(DATA, "+>>$destination") or die "Couldn't open file $destination for reading or writing, $!";

  if (scalar(@list) < 2) {
    my $header = join($s, @csv);
    print DATA $header . "\n";
  }
  my $newLine = "";
  my @missing = ();
  for ($i = 0; $i < scalar(@csv); $i++) {
    my $sep = "";
    if ($i + 1 < scalar(@csv)) {
      $sep = $s;
    }
    my $head = $csv[$i];
    if (!grep(/^$head$/, @arrays)) {
      my $k = $keys{$head};
      if (!($k =~ m/<(\/?)([^>])>/)) {
        $k =~ s/;/|/g;
        # print "A key: $k\n";
        if ($k =~ m/^$/) {
          push(@missing, $head);
        }
        $newLine .= $k . $sep;
      } else {
        push(@missing, $head);
        $newLine .= $sep;
      }
    } else {
      my $ref = $keys{$head};
      $newLine .= join("|", @$ref) . $sep;
    }
  }
  print DATA $newLine . "\n";
  print "\e[103mPrinted\e[0m \n\t$newLine\n";
  close(DATA);
  if (scalar(@missing) > 0) {
    print "\e[41mMissing:\e[0m\n - \e[103m" . join("\e[0m\n - \e[103m", @missing) . "\e[0m\n";
  }
}

sub doubleSplit{
  my ($s1, $s2);
  $s1 = shift(@_);
  $s2 = shift(@_);
  $str = shift(@_);
  if ($str =~ m/$s2/) {
    my (@split1, @split2);
    @split2 = split($s2, $str);
    @split1 = ();
    foreach (@split2) {
      push(@split1, split($s1, $_));
    }
    return @split1;
  } else {
    return split($s1, $str);
  }
}

sub parseContents{
  # First string is the match string
  my ($match, $num, @parts, $reps, $i, $result, $j, @index);
  $match = shift(@_);
  $num = shift(@_); # The number of arrays to return.
  # The array of the unordered pieces that we want to reorder
  @parts = doubleSplit(" - ", "; ", $match);
  $reps = scalar(@parts) / $num; # The number of elements in each array
  $result = "";
  for ($i = $num; $i > 0; $i--) {
    @index = (0..($reps - 1));
    for ($j = 0; $j < $reps; $j++) {
      $index[$j] *= $i;
    }
    my $part = "";
    for ($j = $reps - 1; $j >= 0; $j--) {
      $part = ($part =~ m/\w/) ? join("-", (splice(@parts, $index[$j], 1), $part)) : splice(@parts, $index[$j], 1) . $part;
    }
    $result = ($i == 1) ? $result . $part : $result . $part . "|";
  }
  my @resultArray = split(/\|/, $result);
  my @results = ();
  if ($resultArray[0] =~ m/-/) {
    foreach $r (@resultArray) {
      push(@results, split(/-/, $r));
    }
  } else {
    @results = @resultArray;
  }
  for ($i = 0; $i < scalar(@results); $i++) {
    $results[$i] = cleanit($results[$i]);
    $results[$i] =~ s/\s*$//;
  }
  return (@results);
}

sub subArray{
  my $num = shift(@_);
  my $max = shift(@_);
  my @result = @_;
  if (scalar(@results) > $max) {
    my $remainder = (scalar(@results) % $max);
    my ($reps) = (scalar(@results) - $remainder) / $max;
    return (@result[$num..(($num + 1) * reps - 1)]);
  } else {
    return ($result[$num]);
  }
}


# Assign contents of file to a string
$string = join("\n", getContents(@ARGV));

$string =~ s/\\(['"])/$1/g;
$string =~ s/.*(<title>.*)(<div class='col-xs-12 coursedetail02'>.+\z)/\1/s;

$title = $string;
$title =~ s/.*<title>([^<]+)<\/title>.*/\1/s;
$title =~ s/\s*$//;

@split = split(" ", $title);
$dept = shift(@split);
$dNum = shift(@split);
$titleString = join(" ", @split);

$match = $string;
$match =~ s/.*<div class="coursedetail col-xs-12">(?:\s+)?<div(?:\s+)?class="col-xs-12">(?:\s*<p>\s*)?(.*?)(?:\s*<\/p>){0,1}<\/div>.*/$1/s;
# println("Description: ", $match);
$match =~ s/(<\/p>\s*<p>|\s*<p>)/\|/g;
$match =~ s/\s*<\/p>\s*/\[\|\]/g;
$match =~ s/<.?(?!em|strong|b|i)([^>])>//sg;
$match =~ s/\n/\|/g;

my $description = $match;


# Find the day, Meeting Time(s), and/or the location
$match = $string;
$match =~ s/.*Meeting Time\(s\): ([^<Loc]+).*/\1/s;
my (@results) = parseContents($match, 3);
@day = subArray(0, 3, @results);
@time1 = subArray(1, 3, @results);
@time2 = subArray(2, 3, @results);

#Find the CRN, Credit Hours, Current Enrollment, Seats Available, and Max Enrollment
$match = $string;
$match1 = $string;
$match =~ s/.*CRN: (\d{5}); Credit Hours: ([\d.]*); Current Enrollment: (\d+); Seats Available: (\d+); Max Enrollment: (\d+);.*/\1-\2-\3-\4-\5/s;
$match1 =~ s/.*CRN: (\d{5}); Credit Hours: ([\d.]+); Current Enrollment: (\d+); Seats Available: (\d+);\s*FY Reserved Seats: (\d+); Max Enrollment: (\d+);.*/\1-\2-\3-\4-\5-\6/s;
# println("Match: ", $match, "Match1: ", $match1);
if ($match1 =~ m/^([\d.]+-)+[\d.]+$/ && !($match =~ m/^([\d.]+-)+[\d.]+$/)) {
  $match = $match1;
  ($regNum, $credit, $enrollment, $available, $fyReservedSeats, $max) = split('-', $match);
} else {
  ($regNum, $credit, $enrollment, $available, $max) = split('-', $match);
  $fyReservedSeats = "N/A";
}
# println($regNum, $credit, $enrollment, $available, $max);

#Find the Distributions
$match = $string;
$match =~ s/.*Distributions: ([^<]+).*/$1/s;
# #println($match);
$distributions = cleanit($match);
@result = parseContents($match, 2);
@distCode = subArray(0, 2, @result);
@distDescription = subArray(1, 2, @result);


#Find the Prerequisites
$match = $string;
$match =~ s/.*Prerequisites(\(s\))?: ([^<]+).*/$2/s;
$match = cleanit($match);
$escapedMatch = $match;
$escapedMatch = s/(?<!\\)(\(|\||\*|\[|\]|\)|\+|\$|\^)/\\$1/g;
if ($string =~ /$escapedMatch/) {
  $match =~ s/.*(Permission of Instructor: \w+).*/$1/s;
}
$match =~ s/\s*$//;
$prerequisites = $match;
if (length($prerequisites) >= .5 * length($string)) {
  $prerequisites = "None.";
}

$location = $string;
$location =~ s/.*Loc:\s*([a-zA-Z]+( [a-zA-Z]+)*?)\s*([\w]+)<\/div>.*/$1-$3/s;

@locs = split("-", $location);
print "Locations:\n".join(", ", @locs)."\n";
$building = $locs[0];
$roomNum = $locs[1];

$firstComeFirstServe = $string;
$firstComeFirstServe =~ s/.*First come first serve: (\w*)<\/div>.*/$1/s;
$escapedMatch = $firstComeFirstServe;
$escapedMatch = s/(?<!\\)(\(|\||\*|\[|\]|\)|\+|\$|\^)/\\$1/g;
if ($string =~ m/$escapedMatch/) {
  $firstComeFirstServe = "";
}

$waitlistNotes = $string;
$waitlistNotes =~ s/.*Waitlist Notes: ([^"]+).*/$1/s;
$escapedMatch = $waitlistNotes;
$escapedMatch = s/(?<!\\)(\(|\||\*|\[|\]|\)|\+|\$|\^)/\\$1/g;
if ($string =~ m/$escapedMatch/) {
  $waitlistNotes = "";
}

$waitlistType = $string;
$waitlistType =~ s/.*Waitlist Type: ([\w ]+)<\/div>/$1/s;
$escapedMatch = $waitlistType;
$escapedMatch = s/(?<!\\)(\(|\||\*|\[|\]|\)|\+|\$|\^)/\\$1/g;
if ($string =~ m/$escapedMatch/) {
  $waitlistType = "";
}
#<div id="divHeaders" style="display: none;">
#  AFR 207 01
#</div>
$classCode = $string;
$classCode =~ s/.*<div id="divHeaders" style="display: none;">\s*([^<\n]*)\s*<\/div>.*/$1/s;

$professor = $string;
$professor =~ s/.*<a class="professorname" target=_fac href=faculty_profiles.php?user=(?:\w+)>([^<]+).*/$1/s;
#<a class="professorname" target=_fac href=faculty_profiles.php?user=pobeng>Pashington Obeng

# print "Registration Number: $regNum\n";


# jsonify("$regNum", keyit("fullTitle", $title), keyit("dept", $dept), keyit("dNum", $dNum), keyit("titleString", $titleString), keyit("day", @day), keyit("time1", @time1), keyit("time2", @time2), keyit("regNum", $regNum), keyit("credit", $credit), keyit("enrollment", $enrollment), keyit("available", $available), keyit("max", $max), keyit("distributions", $distributions), keyit("distCode", @distCode), keyit("distDescription", @distDescription), keyit("prerequisites", $match));

my %itemKeys = ("regNum", $regNum, "classCode", $classCode, "professor", $professor, "fullTitle", $title, "dept", $dept, "dNum", $dNum, "titleString", $titleString, "day", \@day, "time1", \@time1, "time2", \@time2, "location", $location, "building", $building, "room", $roomNum, "credit", $credit, "enrollment", $enrollment, "available", $available, "fyReservedSeats", $fyReservedSeats, "max", $max, "distributions", $distributions, "distCode", \@distCode, "distDescription", \@distDescription, "prerequisites", $prerequisites, "description", $description, "waitlistType", $waitlistType, "firstComeFirstServe", $firstComeFirstServe, "waitlistNotes", $waitlistNotes);

my $itemRef = \%itemKeys;

csvify($itemRef);
