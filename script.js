function Go() {
    //validate Input
    var sDate = document.getElementById('input_startDate').value;
    var eDate = document.getElementById('input_endDate').value;
    if (/\d\d\d\d-\d\d-\d\d/.test(sDate) && /\d\d\d\d-\d\d-\d\d/.test(eDate)) {
        GetData(sDate, eDate);
    }
    else {    // call default if not valid
        GetDefault();
    }
}

function GetDefault() {
    var todayD = new Date();
    var startDate = new Date(todayD.setTime(todayD.getTime() - 90 * 86400000));
    todayD = new Date();
    GetData(FormatDate(startDate), FormatDate(todayD));
}

//Uses gh3 library to get data from Github API
function GetData(startDate, endDate) {
    Gh3.Search.repos({
        q: 'created:' + startDate + '..' + endDate,
        sort: 'stars',
        order: 'desc'
    }, { per_page: 100 }, function (err, repos) {
        if (err == null) {
            SetErrorMsg("");
            setTitle("Top 100 starred Repositories(" + startDate + " - " + endDate + ")' languages statistics:");
            AnalyzeData(repos);
        }
        else {
            SetErrorMsg("Invalid Values: Please check your entries!");
        }
    });

}

function AnalyzeData(repos) {
    var statistics = [];
    for (var i = 0; i < repos.length; i++) {
        if (repos[i].language != null) {
            var index = statistics.findIndex(s => s.language == repos[i].language);
            if (index == -1) {
                var item = { language: repos[i].language, totalRepos: 1, AvgForks: repos[i].forks, AvgStars: repos[i].stargazers_count };
                statistics.push(item);
            }
            else {
                statistics[index].totalRepos++;
                statistics[index].AvgForks += repos[i].forks;
                statistics[index].AvgStars += repos[i].stargazers_count;
            }
        }
    }
    //Get the Averages
    for (var i = 0; i < statistics.length; i++) {
        statistics[i].AvgForks = (statistics[i].AvgForks / statistics[i].totalRepos).toFixed(0);
        statistics[i].AvgStars = (statistics[i].AvgStars / statistics[i].totalRepos).toFixed(0);
    }
    RenderData(statistics);
}

function RenderData(statistics) {
    //Remove previosly rendered rows if any
    var myNode = document.getElementById("table_body");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    //Render the new records
    for (var i=0; i <statistics.length; i++){
        var tr = document.createElement('tr');

        var td = document.createElement('td');
        td.appendChild(document.createTextNode(statistics[i].language));
        tr.appendChild(td);

        td = document.createElement('td');
        td.appendChild(document.createTextNode(statistics[i].totalRepos));
        tr.appendChild(td);

        td = document.createElement('td');
        td.appendChild(document.createTextNode(statistics[i].AvgForks));
        tr.appendChild(td);

        td = document.createElement('td');
        td.appendChild(document.createTextNode(statistics[i].AvgStars));
        tr.appendChild(td);

        myNode.appendChild(tr);
    }
}

//helper function
function FormatDate(d) {
    var day = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate();
    var month = d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : '' + (d.getMonth() + 1);
    return (d.getFullYear() + '-' + month + '-' + day);
}

function SetErrorMsg(msg) {
    document.getElementById("error").innerHTML = msg;
}

function setTitle(msg) {
    document.getElementById("table_title").innerHTML = msg;
}
