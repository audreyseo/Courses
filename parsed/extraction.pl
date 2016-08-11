#!/usr/bin/perl
use String::Util ':all';

sub getContents{
  my ($name, @list);
  $name = shift(@_);
  open(DATA, "<$name") or die "Couldn't open file $name for reading, $!";
  @list = <DATA>;
  close(DATA);
  foreach (@list) {
    $_ =~ s/^(.*)\s{1,}$/\1/; # Trims trailing whitespace at the end
    $_ =~ s/\t/  /g; # Translates tabs to spaces for more compact formatting
  }
  return @list;
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
  if ($len == 1) {
    $item =shift(@_);
    $string ="$item";
    if ($string =~ m/^\d+$/) {
      # If it's only digits, then don't put it in quotation marks.
      return "$key: $item";
    }
    return "$key: \"$item\"";
  } else {
    @items =@_;
    return "$key: [\"".join("\", \"", @items)."\"]"
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
  $dir = "/parsed/";
  open(DATA, ">$name.json") or die "Couldn't open file $name.json, $!";
  print "\n\nWritten to file $name.json:\n";
  print $json;
  print DATA $json;
  close(DATA);
}

sub csv{
  my ($s, $joined, $dir);
  $s = ",";

  open(DATA, "+>>log.csv") or die "Couldn't open file log.csv for reading or writing, $!";

}

# Assign contents of file to a string
#$string =
$string = join("\n", getContents(@ARGV));
# println($string);
$string =~ s/.*(<title>.*)(<div class='col-xs-12 coursedetail02'>.+\z)/\1/s;
# $string =~ s/.*(<title>.*?)(?!<div class='col-xs-12 coursedetail02'>.*)/\1/s;
# println($string);


# Find the title of the class
$title = $string;
$title =~ s/.*<title>([^<]+)<\/title>.*/\1/s;

#println($title);

@split = split(" ", $title);
$dept = shift(@split);
$dNum = shift(@split);
$titleString = join(" ", @split);

#println($dept, $dNum, $titleString);

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
  println(@parts);
  $reps = scalar(@parts) / $num; # The number of elements in each array
  $result = "";
  for ($i = $num; $i > 0; $i--) {
    @index = (0..($reps - 1));
    for ($j = 0; $j < $reps; $j++) {
      $index[$j] *= $i;
    }
    println(@index);
    my $part = "";
    # $result = $result . join("-", @parts[@index]);
    for ($j = $reps - 1; $j >= 0; $j--) {
      # $part = ($part =~ m/\w/) ? (($result =~ m/\|$/) ? splice(@parts, $index[$j], 1) . $part : join("-", (splice(@parts, $index[$j], 1), $part))) : splice(@parts, $index[$j], 1) . $part;
      $part = ($part =~ m/\w/) ? join("-", (splice(@parts, $index[$j], 1), $part)) : splice(@parts, $index[$j], 1) . $part;
    }

    $result = ($i == 1) ? $result . $part : $result . $part . "|";
  }
  println($result);
  # print "======================\n";
  my @resultArray = split("|", $result);
  foreach $r (@resultArray) {
    @r = split("-", $r);
  }
  return (@resultArray);
  # print "======================\n";
}

# Find the day, Meeting Time(s), and/or the location
$match = $string;
$match =~ s/.*Meeting Time\(s\): ([^<]+).*/\1/s;
parseContents("Th - 09:00 pm - 10:00 pm; F - 04:00 pm - 06:00 pm", 3);
if ($match =~ /;/) {
  @split = split("; ", $match);
  @splits = ();
  foreach (@split) {
    push(@splits, split(" - ", $_));
  }
  $length = scalar(@splits);
  # #println($length);
  @day = ();
  @time1 = ();
  @time2 = ();
  $i = 0;
  foreach (@splits) {
    if ($i % 3 == 0) {
      push(@day, $_);
    } elsif ($i % 3 == 1) {
      push(@time1, $_);
    } else {
      push(@time2, $_);
    }
    $i++;
  }
} else {
  @split = split(" - ", $match);
  @day = ($split[0]);
  @time1 = ($split[1]);
  @time2 = ($split[2]);
}

#println(@day, @time1, @time2);

#Find the CRN, Credit Hours, Current Enrollment, Seats Available, and Max Enrollment
$match = $string;
$match =~ s/.*CRN: (\d{5}); Credit Hours: (\d); Current Enrollment: (\d+); Seats Available: (\d+); Max Enrollment: (\d+);.*/\1-\2-\3-\4-\5/s;
($regNum, $credit, $enrollment, $available, $max) = split('-', $match);

#println($regNum, $credit, $enrollment, $available, $max);

#Find the Distributions
$match = $string;
$match =~ s/.*Distributions: ([^<]+).*/\1/s;
# #println($match);
if ($match =~ /;/) {
  @split = split("; ", $match);
  @splits = ();
  foreach (@split) {
    push(@splits, split(" - ", $_));
  }
  $length = scalar(@splits);
  @splits = cleanit(@splits);
  # println($length);
  @distCode = ();
  @distDescription = ();
  $i = 0;
  foreach (@splits) {
    if ($i % 2 == 0) {
      push(@distCode, $_);
    } else {
      push(@distDescription, $_);
    }
    $i++;
  }
} else {
  @split = split(" - ", $match);
  # println(@split);
  @split = cleanit(@split);
  # println(@split);
  @distCode = (@split[0]);
  @distDescription = (@split[1]);
}
$distributions = cleanit($match);
#println(@distCode, @distDescription);

#Find the Prerequisites
$match = $string;
$match =~ s/.*Prerequisites\(s\): ([^<]+).*/\1/s;
$match = cleanit($match);
#println($match);


jsonify("$regNum", keyit("fullTitle", $title), keyit("dept", $dept), keyit("dNum", $dNum), keyit("titleString", $titleString), keyit("day", @day), keyit("time1", @time1), keyit("time2", @time2), keyit("regNum", $regNum), keyit("credit", $credit), keyit("enrollment", $enrollment), keyit("available", $available), keyit("max", $max), keyit("distributions", $distributions), keyit("distCode", @distCode), keyit("distDescription", @distDescription), keyit("prerequisites", $match));

#"fullTitle: \"$title\"", "dept: \"$dept\"", "dNum: $dNum", "titleString: \"$titleString\"", "day: [\"" . join("\", \"", @day) . "\"]", "time1: [\"" . join("\", \"", @time1) . "\"]", "time2: [\"" . join("\", \"", @time2) . "\"]", "regNum: $regNum", "credit: $credit", "enrollment: $enrollment", "available: $available", "max: $max", "distributions: \"$distributions\"", "distCode: [\"" . join("\", \"", @distCode). "\"]", "distDescription: [\"" .  join("\", \"", @distDescription) . "\"]", "prerequisites: \"$match\"");
