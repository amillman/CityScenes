(function () {
    $(document).ready(function () {
        $.getJSON('http://maps.googleapis.com/maps/api/directions/json?origin=Museum+Of+The+Moving+Image&destination=34+Ludlow+Street,NY&sensor=false&mode=bicycling', function (data) {
            //console.log(data.routes[0].legs[0].distance);
            //http://maps.googleapis.com/maps/api/directions/json?origin=Museum+Of+The+Moving+Image&destination=34+Ludlow+Street,NY&waypoints=30+Ludlow+St,NY|100+Canal+St,NY&sensor=false&mode=bicycling
            console.log(data);;
            //var leg_duration = []
            //var leg_distance = [];
            //var leg_start = [];
            var leg_end = [];
            var start_wrap = '<span>' + data.routes[0].legs[0].start_address + '<br /><br /></span>';
            $(start_wrap).appendTo('div.directions');//begin directions formatting, start location

            $.each(data.routes[0].legs, function (i, legs) {
                //leg_distance[i] = legs.distance.text;
                //leg_duration[i] = legs.duration.text;
                //leg_start[i] = legs.start_address;
                leg_end[i] = legs.end_address;
                var leg_wrap = '<ol class="directions">';
                //<span class="distance"></span><span class="duration"></span><span class="start"></span></li>'
                console.log(legs.start_address);
                $(leg_wrap).appendTo('div.directions');

                $.each(legs.steps, function (j, steps) {
                    //step_distance[i][j] = steps.distance.text;
                    //step_duration[i][j] = steps.duration.text;
                    //step_instr[i][j] = steps.html_instructions.text;
                    var step_wrap = "<li>" + steps.html_instructions + '<br/><div class="distance" style="text-align:right">' + steps.distance.text + " - about " + steps.duration.text + "</div></li>";
                    $(step_wrap).appendTo('ol.directions');
                })
                leg_wrap = '<br /></ol><span>' + leg_end[i] + '</span>';
                $(leg_wrap).appendTo('div.directions');
            });


        })
    })
})();