sub getFile{
  my $name = shift(@_);
  open(DATA, "<$name") or die "Cannot open $name for reading, $!";
  my @lines = <DATA>;
  close(DATA);
  print join("", @lines) . "\n";
  return \@lines;
}

sub getLines{
  my $name = "/Users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses/Data/parsed_text.json";
  open(DATA, "<$name") or die "Cannot open $name for reading, $!.";
  my @lines = <DATA>;
  close(DATA);
  my $string = join("", @lines);
  my $listRef = $_[0];
  my @list = @$listRef;
  my @result = ();
  print"\n\n";
  for ($i = 0; $i < scalar(@list); $i++) {
    if ($i < (scalar(@list) - 1)) {
      chop($list[$i]);
    }
    my $listItem = $list[$i];
    my $newResult = $string;
    $newResult =~ s/.*(\[$listItem([^\]]+)\]).*/$1/s;
    print "List Item: $listItem\n";
    print "Result $i of $listItem: $newResult\n";
    push(@result, $newResult);
  }
  print "Results:\n" . join("\n", @result) . "\n";
  return join("\n", @result);
}

sub saveLines{
  my @list = split("\n", $_[0]);
  my $fileName = $_[1];
  my $name = "/Users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses/data/$fileName";
  open(DATA, ">$name") or die "Cannot open $name for writing, $!.";
  print "File name!!!: $name\n";
  print DATA "{\n\t\"courses\":\n\t\t[\n";
  $i = 1;
  print "List:\n" . join("\n", @list) . "\n";
  foreach $line (@list) {
    if ($i < scalar(@list)) {
      $line .= ",";
    }
    print DATA "\t\t\t$line\n";
    print $line . "\n";
    $i++;
  }
  print DATA "\t\t]\n}";
  close(DATA);
}

$listFileRef = getFile(@ARGV);

$fileName = "problem_classes.json";
print "File name: $fileName\n";
$lines = getLines($listFileRef);
print "Lines:\n$lines\n";
saveLines($lines, $fileName);
