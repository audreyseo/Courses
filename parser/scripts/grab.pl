#!/usr/bin/perl

sub gatherArgs{
  my $one = $_[0];
  my $two = $_[1];
  return ($one, $two);
}

sub getCourses{
  my ($fileName) = "/users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses/data/parsed_text.json";
  open(DATA, "<$fileName") or die "Could not open $fileName for reading, $!";
  my @lines = <DATA>;
  close(DATA);
  return join("", @lines);
}

sub saveContents{
  my ($fileName) = "/users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses/data/bad_courses.json";
  open(DATA, ">$fileName") or die "Could not open file $fileName for writing, $!";
  my $data = $_[0];
  print DATA "{\n\t\"courses\":\n\t\t[";
  print DATA $data;
  print DATA "\n\t\t]\n}";
  close(DATA);
  print "\nSuccessfully Wrote and Closed DATA.\n\n";
}

($start, $end) = gatherArgs(@ARGV);

$string = getCourses();

# print "Got string:\n$string\n\n";
$firstMatch = $string;
$secondMatch = $string;
$match = $string;
$firstMatch =~ s/.*?(\[$start[^\n]+).*/$1/s;
$secondMatch =~ s/.*?(\[$end[^\n]+).*/$1/s;
$match =~ s/.*?(\s+\[$start[^\n]+)(.+)(\[$end[^\n]+).*/$1$2$3/s;
# print "Parsed string:\n$firstMatch\n\n$secondMatch\n\n$match\n\n"

saveContents($match);
