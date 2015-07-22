﻿using Abitcareer.Mvc.Components.CustomExceptions;
using CultureEngine;
using Elmah;
using CultureEngine;
using StackExchange.Profiling;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Abitcareer.Mvc
{
    public class AbitcareerApplication : System.Web.HttpApplication
    {
        private IHttpModule Module = new LocalizationHttpModule();

        protected void Application_Start()
        {
            ControllerBuilder.Current.DefaultNamespaces.Add("Abitcareer.Mvc.Controllers");

            AreaRegistration.RegisterAllAreas();
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        public void ErrorMail_Filtering(object sender, ExceptionFilterEventArgs e)
        {
            var httpException = e.Exception as JavaScriptException;
            if (httpException != null)
            {
                e.Dismiss();
            }
        }

        protected void Application_BeginRequest()
        {
            MiniProfiler.Start();
        }

        protected void Application_EndRequest()
        {
            MiniProfiler.Stop();
        }

        //for specific users
        private bool IsUserAllowedToSeeMiniProfilerUI(HttpRequest httpRequest)
        {
            var principal = httpRequest.RequestContext.HttpContext.User;
            return principal.IsInRole("admin");
        }

        public override void Init()
        {
            base.Init();
            Module.Init(this);
        }
        //Database
        /*public static DbConnection GetOpenConnection()
        {
            var cnn = CreateRealConnection(); // A SqlConnection, SqliteConnection ... or whatever

            // wrap the connection with a profiling connection that tracks timings 
            return new StackExchange.Profiling.Data.ProfiledDbConnection(cnn, MiniProfiler.Current);
        }*/
    }
}