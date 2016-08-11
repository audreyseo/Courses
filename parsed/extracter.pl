#!/usr/bin/perl

sub println{
  my ($joined) = join("\n\n", @_);
  print "\n\n$joined\n\n";
}

sub cleanit{
  my ($len) = scalar(@_);
  if ($len == 1) {
    my ($item) = shift(@_);
    $item =~ s/[\s]{2,}//gs;
    return $item;
  } else {
    # println(@_);
    my (@items) = ();
    foreach (@_) {
      $_ =~ s/\s{2,}//gs;
      my ($result) = $_;
      # println($result);
      push(@items, $result); #$_ =~ s/\s{2,}//gs);
    }
    # println(@items);
    return @items;
  }
}

sub keyit{
  # Takes in a name and a scalar/array and formats it for JSON
  # i.e. (key, (list, of, things)) => "key: ["list", "of", "things"]"
  my ($key) = shift(@_);
  my ($len) = scalar(@_);
  if ($len == 1) {
    my ($item) = shift(@_);
    my ($string) = "$item";
    if ($string =~ m/^\d+$/) {
      # If it's only digits, then don't put it in quotation marks.
      return "$key: $item";
    }
    return "$key: \"$item\"";
  } else {
    my (@items) = @_;
    return "$key: [\"".join("\", \"", @items)."\"]"
  }
}

# Function: jsonify turns a list of one name and 1-n "key: value"s into a single JSON object that has one key, the $name specified.
sub jsonify{
  # First argument = name of the JSON object.
  my ($name) = shift(@_);
  # Specify a custom tab of 2 spaces.
  my ($t) = "  ";
  # First join all of the keys/values.
  my ($joined) = "\n$t\{\n$t$t" . join(",\n$t$t", @_) . "\n$t\}";
  # Now join it to the name with all of the proper brackets.
  my ($json) =  "\n{\n$t$name:$joined\n}\n\n";
  # Print to a file with the same name as the course registration number. This is passed to the server in the query string using "?crn=_____" so this should be perfect for getting the file once it finishes. Now I just need to find out how I can do this from within NodeJS................(crickets)...........
  my ($dir) = "/parsed/";
  open(DATA, ">$name.json") or die "Couldn't open file $name.json, $!";
  print "\n\nWritten to file $name.json:\n";
  print $json;
  print DATA $json;
  close(DATA);
}

# Assign contents of file to a string
#$string =
$string = <<'EOF';
<html> (get_courses.js, line 46)
<head>
  <script type="text/javascript">var switchTo5x=true;</script>
  <!-- <script type="text/javascript" src="https://ws.sharethis.com/button/buttons.js"></script> -->
  <script type="text/javascript">stLight.options({publisher: "42749a5b-852f-4abd-9037-507e14846fae", doNotHash: false, doNotCopy: false, hashAddressBar: false});</script>
  <script>
  function myFavorites(q_string,crn)
  {
    if ( ($('#my_favorite_'+crn).is(":visible"))) {
      $('#my_favorite').hide();
    }
    else {
      $('#my_favorite_' + crn).show();
      var p_url= "https://webapps.wellesley.edu/my_courses/favorites.php";
      var p_data = q_string;
      jQuery.ajax({
        type: "GET",
        url: p_url,
        data: p_data,
        success: function(data) {
          // $('#my_favorite_' + crn).html(data);
          // $('div.favorite').replaceWith('<i class="fa fa-star pull-right"></i>');
          // $('div.favorite > i.fa-star-o').replaceWith('<i class="fa fa-star pull-right"></i>');
          // $('div.favorite').parent().prev().find('.fa').addClass(".fa-star");
          // $('div.favorite').parent().prev().find('i').addClass("fa-star");

          $('div.favorite').parent().prev().children('.coursecode_big').children('div').append('<i class="fa fa-star pull-right"></i>');
          $('div.favorite').hide();
        }

      });
    }
  }

  function myWaitlist(q_string,crn)
  {
    if ( ($('#my_waitlist_'+crn).is(":visible"))) {
      $('#my_waitlist').hide();
    }
    else {
      $('#my_waitlist_' + crn).show();
      var p_url= "https://webapps.wellesley.edu/my_courses/waitlist.php";
      var p_data = q_string + '&ajax=1';
      jQuery.ajax({
        type: "GET",
        url: p_url,
        data: p_data,
        success: function(data) {
          // $('#my_favorite_' + crn).html(data);
          // $('div.favorite').replaceWith('<i class="fa fa-star pull-right"></i>');
          // $('div.favorite > i.fa-star-o').replaceWith('<i class="fa fa-star pull-right"></i>');
          // $('div.favorite').parent().prev().find('.fa').addClass(".fa-star");
          // $('div.favorite').parent().prev().find('i').addClass("fa-star");
          if (data.search('Error:') > -1) {
            alert(data);
          }
          else {
            $('div.waitlist').parent().prev().children('.coursecode_big').children('div').append('<i class="pull-right"><b><font color="#009900">W</font></b></i>');
            $('div.waitlist').hide();
            document.location = p_url;
          }
        }

      });
    }
  }
  function setCookieAndToggle(v1, v2) {
    var d = new Date();
    d.setTime(d.getTime() + (5*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie =  "hideCB=1; " + expires;
    toggleDiv(v1,v2);
  }

  function clearCookieAndToggle(v1, v2) {
    var d = new Date();
    var expires = "expires=Thu, 01-Jan-1970 00:00:01 GMT;";
    document.cookie =  "hideCB=1; " + expires;
    toggleDiv(v1,v2);
  }
  </script>

  <title>AFR 207 Images of Africana People Through the Cinema</title>
</head>
<b><font size=4>1</font></b>
<a href="javascript:clearCookieAndToggle('details','block')">Show</a> | <a href="javascript:setCookieAndToggle('details','none')">Hide</a> </div><br>
<div id="divHeaders" style="display: none;">
  AFR 207 01
</div>
<div id="my_favorite_13958" style="display: none;"></div>
<div id="my_waitlist_13958" style="display: none;"></div>
<div class="professorhead col-xs-3"><a target=_fac href=faculty_profiles.php?user=pobeng>
  <img src="//www.wellesley.edu/sites/default/files/obeng.jpg">
</a>
</div>
<a class="professorname" target=_fac href=faculty_profiles.php?user=pobeng>Pashington Obeng</a>
<div class="coursedetail col-xs-12">
  <div class="col-xs-12">
    <p>
      An investigation of the social, political, and cultural aspects of development of Africana people through the viewing and analysis of films from Africa, Afro-America, Brazil, and the Caribbean. The class covers pre-colonial, colonial, and postcolonial experiences and responses of Africana people. Films shown will include <em>Sugar Cane Alley</em>, <em>Zan</em> <em>Boko</em>, and <em>Sankofa</em>.
    </p>
  </div>
  <div class="col-xs-12 coursedetail01">
    CRN: 13958; Credit Hours: 1; Current Enrollment: 22; Seats Available: 3; Max Enrollment: 25;
  </div>
  <div class="col-xs-12 coursedetail01">Meeting Time(s): T - 07:00 pm - 09:30 pm; W - 09:00 pm - 10:00 pm</div>
  <div class="col-xs-12 coursedetail01">
    Distributions: ARS - Arts, Music, Theatre, Film and Video
  </div>
  <div class="col-xs-12 coursedetail01">
    Prerequisites(s): None
  </div>
  <div class='col-xs-12 coursedetail02'>
    <span class='st_sharethis' displayText='ShareThis' st_title='Images of Africana People Through the Cinema - Pashington Obeng' st_url='https://webapps.wellesley.edu/new_course_browser/?crn=13958' st_via='Wellesley'></span>
    <span class='st_facebook' displayText='Facebook' st_url='https://webapps.wellesley.edu/new_course_browser/?crn=13958&message=Images of Africana People Through the Cinema - Pashington Obeng'></span>
    <span class='st_twitter' displayText='Tweet' st_title='Images of Africana People Through the Cinema - Pashington Obeng #WellesleyCourse' st_url='https://webapps.wellesley.edu/new_course_browser/?crn=13958' st_via='Wellesley'></span>
    <span class='st_linkedin' displayText='LinkedIn' st_title='Images of Africana People Through the Cinema - Pashington Obeng' st_url='https://webapps.wellesley.edu/new_course_browser/?crn=13958' st_via='Wellesley'></span>
    <span class='st_pinterest' displayText='Pinterest' st_title='Images of Africana People Through the Cinema - Pashington Obeng' st_url='https://webapps.wellesley.edu/new_course_browser/?crn=13958' st_via='Wellesley'></span>
    <span class='st_email' displayText='Email' st_title='Images of Africana People Through the Cinema - Pashington Obeng' st_url='https://webapps.wellesley.edu/new_course_browser/?crn=13958' st_via='Wellesley'></span>
  </div></div>
EOF

# Find the title of the class
$title = $string;
$title =~ s/.*<title>([^<]+)<\/title>.*/\1/s;

#println($title);

@split = split(" ", $title);
$dept = shift(@split);
$dNum = shift(@split);
$titleString = join(" ", @split);

#println($dept, $dNum, $titleString);

# Find the day, Meeting Time(s), and/or the location
$match = $string;
$match =~ s/.*Meeting Time\(s\): ([^<]+).*/\1/s;
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
