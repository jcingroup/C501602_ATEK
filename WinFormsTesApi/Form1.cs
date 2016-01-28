using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using ProcCore.Business.LogicConect;
using Newtonsoft.Json;
namespace WinFormsTesApi
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            LogicCenter lg = new LogicCenter("SR-NetWeb,sa,jcin@4257386~");

           // lg.SettleCal(2015, 10);
        }

        private void button2_Click(object sender, EventArgs e)
        {
            LogicCenter lg = new LogicCenter("SR-NetWeb,sa,jcin@4257386~");

            //var t = lg.GetShareBySales("M002", null);
            //var s = JsonConvert.SerializeObject(t);
        }
    }
}
