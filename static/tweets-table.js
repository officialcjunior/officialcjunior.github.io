jQuery(function () {
    // Customize DataTable of id linksTable
    $('#linksTable').DataTable({
        // Set the default number of rows to display
        "pageLength": 25,
        
        // Set default view as default view with no sort
        "order": [],
        
        // allow paging
        "paging": true,
        
        // turn off sorting for column 3
        "columnDefs": [
            { "orderable": false, "targets": 3 }
        ],
        
        // set paging type to simple numbers
        "sPaginationType": "full_numbers",
        
        // add toggle search bar for column 3
        "initComplete": function () {
            this.api().columns([3]).every(function () {
                var column = this;
                var select = $('<select><option value="">All</option></select>')
                    .appendTo($(column.header()))
                    .on('change', function () {
                        var val = $.fn.dataTable.util.escapeRegex($(this).val());
                        column.search(val ? '^' + val + '$' : '', true, false).draw();
                    });
                column.data().unique().sort().each(function (d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>');
                });
            });
        },
        
        // Turn on hover effect
        "hover": true,
        
        // Turn off striping
        "stripeClasses": [],

        // Make it compact
        "lengthChange": false,
    });
});
