#!/usr/bin/perl
sub getFile{
  my $name = shift(@_);
  open(DATA, "<$name") or die "Could not open $name for reading, $!";
  my @lines = <DATA>;
  close(DATA);
  return join("", @lines);
}

sub escape{
  my $raw = shift(@_);
  my $escaped = $raw;
  $escaped =~ s/(?<!\\)(\*|\||\[|\]|\{|\}|\(|\)|\+|\.|\$|\^|\/|\\)/\\$1/g;
  return $escaped;
}

$here = "/Users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses/parser/scripts/";
$fileA = $here."extraction.pl";
$fileB = $here."test_extraction.pl";

$rawA = getFile($fileA);
$rawB = getFile($fileB);
$processedA = escape($rawA);
$processedB = escape($rawB);

@rawLinesA = split("\n", $rawA);
@rawLinesB = split("\n", $rawB);
@escLinesA = split("\n", $processedA);
@escLinesB = split("\n", $processedB);

print "\n\e[91mLines of A not in B:\e[0m\n";
my $count = 0;

for (my $i = 0; $i < scalar(@escLinesA); $i++) {
  my $testLine = $escLinesA[$i];
  if (!($rawB =~ m/$testLine/)) {
    my $index = $i + 1;
    print "$index: $rawLinesA[$i]\n";
    $count++;
  }
}
print "\n\e[31mNumber of Differing Lines: $count\e[0m\n";


$count = 0;
print "\n\e[91mLines of B not in A:\e[0m\n";
for (my $i = 0; $i < scalar(@escLinesB); $i++) {
  my $testLine = $escLinesB[$i];
  if (!($rawA =~ m/$testLine/)) {
    my $index = $i + 1;
    print "$index: $rawLinesB[$i]\n";
    $count++;
  }
}
print "\n\e[31mNumber of Differing Lines: $count\e[0m\n";

print "\n";
