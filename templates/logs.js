module.exports = `<!DOCTYPE html5>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="shortcut icon" href="https://cdn.auth0.com/styleguide/2.0.1/lib/logos/img/favicon.png" />
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/manage/v0.3.973/css/index.min.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styleguide/3.1.6/index.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/webtask-editor/styles/1/wt-editor.min.css">
    <script type="text/javascript" src="https://cdn.auth0.com/auth0-extend/components/2/extend-editor-logs.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script type="text/javascript" src="https://fb.me/react-0.14.0.min.js"></script>
    <script type="text/javascript" src="https://fb.me/react-dom-0.14.0.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"></script>
    <script type="text/javascript" src="https://cdn.auth0.com/js/jwt-decode-1.4.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.auth0.com/js/navbar-1.0.4.min.js"></script>
    <title>Logs of <%= container %></title>
    <style>
        body, html {
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          padding-bottom: 0;
        }

        .header {
          flex: 0 0 100px;
        }
        .body {
          flex: 1;
        }
        .container {
          min-width: 100%;
        }

        .logs {
          flex: 1;
        }

        .message {
          position: absolute;
          z-index: 1000;
          width: 100%;
          top: 100px;
          display: none;
        }

        .message div {
          height: 75px;
          width: 250px;
          background: #707070;
          vertical-align: middle;
          margin-left: auto;
          margin-right: auto;
          line-height: 71px;
          border-radius: 3px;
          text-align: center;
        }

        .wt-close {
          display: none;
        }
    </style>
    <script type="text/javascript">
      sessionStorage.setItem('token', '<%- a0Token %>');
    </script>
  </head>
  <body class="a0-extension">
    <header class="dashboard-header">
      <nav role="navigation" class="navbar navbar-default">
        <div class="container">
          <div class="navbar-header">
            <h1 class="navbar-brand">
              <a href="<%- manageUrl %>"><span>Auth0</span></a>
            </h1>
          </div>
          <div id="navbar-collapse" class="collapse navbar-collapse">
            <script type="text/babel">
              ReactDOM.render(
                <Navbar baseUrl="<%- baseUrl%>" domain='<%- rta %>'/>,
                document.getElementById('navbar-collapse')
              );
            </script>
          </div>
        </div>
      </nav>
    </header>

    <div class="container extension-header">
      <div class="row">
        <section class="content-page current">
          <div class="col-xs-12">
            <div class="row">
              <div class="col-xs-12 content-header">
                <ol class="breadcrumb">
                  <li><a href="<%- manageUrl %>" target="_blank">Auth0 Dashboard</a>
                  </li>
                  <li><a href="<%- manageUrl %>/#/extensions" target="_blank">Extensions</a>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        <div id="content-area">
          <div class="col-xs-12 wrapper">
            <section class="content-page current">
              <div class="content-header">
                <h1>Real-time Webtask Logs</h1>
                <button class="btn btn-default pull-right js-full-screen">Full Screen Mode</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    <div class="message"><div>Press ESC to exit full screen mode</div></div>
    <div id="widget_container" class="logs"></div>
    <script>
      ExtendEditorLogsComponent.show(document.getElementById('widget_container'), {
        token: '<%- token %>',
        hostUrl: '<%- webtaskAPIUrl %>',
        showErrors: true,
        autoReconnect: false,
        theme: 'dark'
      });

      $('.js-full-screen').on('click', function () {
        $('.dashboard-header').hide();
        $('.extension-header').hide();
        $('body').attr('style', 'padding-top: 0;');
        $('.message').show();

        setTimeout(function() {
          $('.message').fadeOut('slow');
        }, 1500);
      });

      $(document).keyup(function(e) {
        if (e.keyCode === 27) {
         $('.dashboard-header').show();
         $('.extension-header').show();
         $('body').removeAttr('style');
        }
      });
    </script>
  </body>
</html>`;
