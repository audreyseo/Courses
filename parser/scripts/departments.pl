sub material{
  my $file = "../../depts_raw.txt";
  open(DATA, "<$file") or die "Could not read file $file, $!";
  my @lines = <DATA>;
  close(DATA);
  return join("", @lines);
}

sub parseLines{
  my @lines = split("\n", $_[0]);
  my @parsed = ();
  foreach $line (@lines){
    my $newline = $line;
    $newline =~ s/<option value="(\w+)"(?:[^>]+)>([^<]+)<\/option>/$1-$2/;
    push(@parsed, split("-", $newline));
  }
  return \@parsed;
}

sub csv{
  my $file = "/Users/Audrey/Personal/Programming/Python/Workspace/WellesleyCourses/parser/csv/departments.csv";
  my $ref = $_[0];
  my @parsed = @$ref;
  open(DATA, ">$file") or die "Could not open file $file for writing, $!";
  print DATA "code,name\n";
  for (my $i = 0; $i < scalar(@parsed); $i+=2) {
    my $code = $parsed[$i];
    my $name = $parsed[$i + 1];
    print DATA "$code,$name\n";
  }
  close DATA;
}

$material = material();

$linesRef = parseLines($material);

csv($linesRef);
